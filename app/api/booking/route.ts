import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from "@/lib/services/supabase"
import { hashSessionToken } from "@/lib/utils/sessionToken"

const UNIQUE_VIOLATION = "23505"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
                  || req.cookies.get('vb_session')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "NO_TOKEN" }, { status: 401 });
    }

    const experienceCode = typeof body.experienciaId === "string" ? body.experienciaId.trim() : ""
    const requestedDate = typeof body.fechaDeseada === "string" ? body.fechaDeseada : null
    // Jusqu'à 3 options de date proposées par le bénéficiaire (voir MAX_DATES
    // dans app/reservar/fechas/page.tsx) — stockées à part de requested_date
    // (qui reste la date active/effective utilisée par confirm/reschedule/cron)
    // pour que l'équipe les voie toutes côté /pedidos.
    const requestedDates = Array.isArray(body.fechasDeseadas)
      ? body.fechasDeseadas.filter((d: unknown): d is string => typeof d === "string" && d.length > 0).slice(0, 3)
      : requestedDate ? [requestedDate] : null
    const cantidadPersonas = body.cantidadPersonas
    const mensaje = typeof body.mensaje === "string" ? body.mensaje : ""
    const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim().slice(0, 30) : ""
    // La table bookings n'a pas de colonne dédiée au nombre de personnes ni
    // au WhatsApp du bénéficiaire — repliés dans message pour ne pas modifier
    // le schéma partagé avec le site vitrine (même logique que Horario avant).
    const message = [mensaje, cantidadPersonas ? `Personas: ${cantidadPersonas}` : null, whatsapp ? `WhatsApp: ${whatsapp}` : null]
      .filter(Boolean)
      .join(" · ")
      .slice(0, 500)

    if (!experienceCode) {
      return NextResponse.json({ success: false, error: "INVALID_INPUT" });
    }

    const supabase = getSupabase()

    const { data: session, error: sessionError } = await supabase
      .from("activation_sessions")
      .select("activation_code_id, expires_at, revoked_at")
      .eq("token_hash", hashSessionToken(token))
      .maybeSingle()

    if (sessionError) {
      console.error("BOOKING SESSION FETCH ERROR:", sessionError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    if (!session || session.revoked_at || new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "INVALID_SESSION" });
    }

    const { data: activationCode, error: codeError } = await supabase
      .from("activation_codes")
      .select("status")
      .eq("id", session.activation_code_id)
      .maybeSingle()

    if (codeError || !activationCode || activationCode.status !== "activated") {
      return NextResponse.json({ success: false, error: "CANNOT_BOOK" });
    }

    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        activation_code_id: session.activation_code_id,
        experience_code: experienceCode,
        requested_date: requestedDate,
        requested_dates: requestedDates,
        message,
      })
      .select("id")
      .single()

    if (insertError) {
      if (insertError.code === UNIQUE_VIOLATION) {
        return NextResponse.json({ success: false, error: "ALREADY_HAS_BOOKING" });
      }
      console.error("BOOKING INSERT ERROR:", insertError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    return NextResponse.json({ success: true, bookingId: booking.id });

  } catch (error) {
    console.error("BOOKING ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
