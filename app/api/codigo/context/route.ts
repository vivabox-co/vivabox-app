import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from "@/lib/services/supabase"
import { hashSessionToken } from "@/lib/utils/sessionToken"
import { SESSION_VALIDITY_DAYS, SESSION_RENEWAL_THRESHOLD_DAYS } from "@/lib/constants/session"

// estado renvoyé au middleware, dans le vocabulaire historique (ère Google
// Sheets) qu'il attend déjà : Activada / Reservada / Confirmada. "Rechazada"
// est propre à l'app (pas de site vitrine concerné) : réservation refusée
// par le lieu, pas encore relancée.
type Estado = "Activada" | "Reservada" | "Confirmada" | "Rechazada"

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ success: false, error: "NO_TOKEN" });
    }

    const supabase = getSupabase()

    const { data: session, error: sessionError } = await supabase
      .from("activation_sessions")
      .select("activation_code_id, expires_at, revoked_at")
      .eq("token_hash", hashSessionToken(token))
      .maybeSingle()

    if (sessionError) {
      console.error('Error in /api/codigo/context (session):', sessionError);
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    if (!session || session.revoked_at || new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "INVALID_SESSION" });
    }

    // Session glissante : si elle entre dans sa seconde moitié de vie, on la
    // prolonge de SESSION_VALIDITY_DAYS pleins — tant que le bénéficiaire
    // revient de temps en temps, il ne se fait jamais déconnecter. Pas de
    // renouvellement à chaque requête pour éviter un UPDATE Supabase sur
    // chaque navigation d'un utilisateur déjà bien dans sa fenêtre.
    let renewedExpiresAt: string | null = null
    const renewalThreshold = new Date(Date.now() + SESSION_RENEWAL_THRESHOLD_DAYS * 24 * 60 * 60 * 1000)
    if (new Date(session.expires_at) < renewalThreshold) {
      renewedExpiresAt = new Date(Date.now() + SESSION_VALIDITY_DAYS * 24 * 60 * 60 * 1000).toISOString()
      const { error: renewError } = await supabase
        .from("activation_sessions")
        .update({ expires_at: renewedExpiresAt })
        .eq("token_hash", hashSessionToken(token))
      if (renewError) {
        console.error("SESSION RENEWAL ERROR:", renewError)
        renewedExpiresAt = null
      }
    }

    const { data: activationCode, error: codeError } = await supabase
      .from("activation_codes")
      .select("status")
      .eq("id", session.activation_code_id)
      .maybeSingle()

    if (codeError || !activationCode || activationCode.status !== "activated") {
      return NextResponse.json({ success: false, error: "NOT_ACTIVATED" });
    }

    // "cancelled" est inclus (contrairement à avant) pour que le middleware
    // puisse renvoyer estado="Rechazada" plutôt que de faire comme si aucune
    // réservation n'avait jamais existé — sinon /reservar/seguimiento devenait
    // inaccessible pile quand la personne a le plus besoin d'y lire pourquoi.
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("activation_code_id", session.activation_code_id)
      .in("status", ["requested", "alternative_proposed", "confirmed", "completed", "cancelled"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (bookingError) {
      console.error('Error in /api/codigo/context (booking):', bookingError);
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    let estado: Estado = "Activada"
    if (booking?.status === "requested" || booking?.status === "alternative_proposed") estado = "Reservada"
    if (booking?.status === "confirmed" || booking?.status === "completed") estado = "Confirmada"
    if (booking?.status === "cancelled") estado = "Rechazada"

    return NextResponse.json({
      success: true,
      data: { estado, booking_id: booking?.id ?? null, renewedExpiresAt },
    });

  } catch (error) {
    console.error('Error in /api/codigo/context:', error);
    return NextResponse.json({ success: false, error: "SERVER_ERROR" });
  }
}
