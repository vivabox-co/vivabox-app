import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from "@/lib/services/supabase"
import { hashSessionToken } from "@/lib/utils/sessionToken"
import { MOMENT_LABEL } from "@/lib/utils/moment"

// Le bénéficiaire répond à une date alternative proposée par l'équipe
// (status "alternative_proposed", saisie depuis /pedidos-.../reservas —
// voir reservas/actions.ts côté site vitrine). "accept" bascule la
// réservation en confirmed sur la date proposée ; "decline" l'annule pour
// libérer le code d'activation, afin que le bénéficiaire puisse demander
// une autre expérience depuis /mapa ou /lista.
//
// "decline" sert aussi à écarter une réservation déjà refusée (status
// "cancelled", écran "rejected" — voir seguimiento/[bookingId]/page.tsx) :
// dans ce cas on passe à "cancelled_seen" plutôt que de re-écrire
// "cancelled". La distinction compte pour /api/codigo/context, dont la
// requête ne liste QUE "cancelled" (pas "cancelled_seen") parmi les statuts
// pris en compte pour déterminer la réservation active — un booking
// "cancelled_seen" devient donc invisible pour elle, et le bénéficiaire
// retombe sur estado "Activada" (→ /mapa) au lieu de revoir cet écran en
// boucle à chaque chargement de l'app.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
                  || req.cookies.get('vb_session')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "NO_SESSION" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action === "accept" || body.action === "decline" ? body.action : null

    if (!action) {
      return NextResponse.json({ success: false, error: "INVALID_INPUT" }, { status: 400 });
    }

    const supabase = getSupabase()

    const { data: session, error: sessionError } = await supabase
      .from("activation_sessions")
      .select("activation_code_id, expires_at, revoked_at")
      .eq("token_hash", hashSessionToken(token))
      .maybeSingle()

    if (sessionError) {
      console.error("BOOKING RESPOND-ALTERNATIVE SESSION ERROR:", sessionError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    if (!session || session.revoked_at || new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "INVALID_SESSION" });
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, activation_code_id, status, message, proposed_date, proposed_moment, proposed_hour")
      .eq("id", bookingId)
      .maybeSingle()

    if (bookingError) {
      console.error("BOOKING RESPOND-ALTERNATIVE FETCH ERROR:", bookingError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    if (!booking || booking.activation_code_id !== session.activation_code_id) {
      return NextResponse.json({ success: false, error: "BOOKING_NOT_FOUND" });
    }

    if (action === "decline" && booking.status === "cancelled") {
      const { data: updated, error: updateError } = await supabase
        .from("bookings")
        .update({ status: "cancelled_seen" })
        .eq("id", bookingId)
        .select("id, status")
        .maybeSingle()

      if (updateError) {
        console.error("BOOKING RESPOND-ALTERNATIVE DISMISS ERROR:", updateError)
        return NextResponse.json({ success: false, error: "SERVER_ERROR" });
      }

      return NextResponse.json({ success: true, data: updated });
    }

    if (booking.status !== "alternative_proposed") {
      return NextResponse.json({ success: false, error: "INVALID_STATUS" });
    }

    if (action === "decline") {
      const { data: updated, error: updateError } = await supabase
        .from("bookings")
        .update({ status: "cancelled", proposed_date: null, proposed_moment: null, proposed_hour: null })
        .eq("id", bookingId)
        .select("id, status")
        .maybeSingle()

      if (updateError) {
        console.error("BOOKING RESPOND-ALTERNATIVE DECLINE ERROR:", updateError)
        return NextResponse.json({ success: false, error: "SERVER_ERROR" });
      }

      return NextResponse.json({ success: true, data: updated });
    }

    // action === "accept" : la date/le créneau proposés deviennent la
    // demande active — même repli du créneau dans `message` que /reschedule,
    // pour que le GET existant continue à en extraire "Horario: ...".
    const otherSegments = (booking.message || "")
      .split(" · ")
      .filter((seg: string) => seg.trim() && !seg.trim().startsWith("Horario:"))
    const momentLabel = booking.proposed_moment ? (MOMENT_LABEL[booking.proposed_moment] ?? booking.proposed_moment) : null
    const horarioSegment = momentLabel
      ? (booking.proposed_hour ? `Horario: ${momentLabel} (~${booking.proposed_hour})` : `Horario: ${momentLabel}`)
      : null
    const message = [horarioSegment, ...otherSegments].filter(Boolean).join(" · ").slice(0, 500)

    const { data: updated, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        requested_date: booking.proposed_date,
        message,
        proposed_date: null,
        proposed_moment: null,
        proposed_hour: null,
      })
      .eq("id", bookingId)
      .select("id, status, requested_date, message")
      .maybeSingle()

    if (updateError) {
      console.error("BOOKING RESPOND-ALTERNATIVE ACCEPT ERROR:", updateError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    return NextResponse.json({ success: true, data: updated });

  } catch (error) {
    console.error("BOOKING RESPOND-ALTERNATIVE ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
