import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from "@/lib/services/supabase"
import { hashSessionToken } from "@/lib/utils/sessionToken"
import { MOMENT_LABEL } from "@/lib/utils/moment"

// Distinct de PATCH sur /api/booking/[bookingId] (annulation, réservée à
// l'équipe via ADMIN_API_KEY) : ici c'est le client lui-même, via sa propre
// session vb_session, qui ajuste sa demande de date tant qu'elle n'a pas
// encore été confirmée par le lieu.

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
    const date = typeof body.date === "string" ? body.date : ""
    const moment = typeof body.moment === "string" ? body.moment : ""
    const hour = typeof body.hour === "string" ? body.hour : null

    if (!date || !MOMENT_LABEL[moment]) {
      return NextResponse.json({ success: false, error: "INVALID_INPUT" }, { status: 400 });
    }

    const supabase = getSupabase()

    const { data: session, error: sessionError } = await supabase
      .from("activation_sessions")
      .select("activation_code_id, expires_at, revoked_at")
      .eq("token_hash", hashSessionToken(token))
      .maybeSingle()

    if (sessionError) {
      console.error("BOOKING RESCHEDULE SESSION ERROR:", sessionError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    if (!session || session.revoked_at || new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "INVALID_SESSION" });
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, activation_code_id, status, message")
      .eq("id", bookingId)
      .maybeSingle()

    if (bookingError) {
      console.error("BOOKING RESCHEDULE FETCH ERROR:", bookingError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    if (!booking || booking.activation_code_id !== session.activation_code_id) {
      return NextResponse.json({ success: false, error: "BOOKING_NOT_FOUND" });
    }

    // Une fois confirmée (ou refusée/terminée), la date ne se change plus
    // depuis l'app — ça passe par l'équipe (Hablar con Mariana).
    if (booking.status !== "requested") {
      return NextResponse.json({ success: false, error: "INVALID_STATUS" });
    }

    // Le créneau est replié dans `message` (voir /api/booking) : on
    // remplace juste le segment "Horario: ..." en gardant le reste
    // (ex: "Personas: N") intact.
    const otherSegments = (booking.message || "")
      .split(" · ")
      .filter((seg: string) => seg.trim() && !seg.trim().startsWith("Horario:"))
    const horarioSegment = hour ? `Horario: ${MOMENT_LABEL[moment]} (~${hour})` : `Horario: ${MOMENT_LABEL[moment]}`
    const message = [horarioSegment, ...otherSegments].join(" · ").slice(0, 500)

    // Le statut dérivé "searching_alternative" (GET /api/booking/[bookingId])
    // se base sur requested_dates, pas requested_date : sans le mettre à jour
    // aussi ici, un reschedule depuis cet état gardait l'ancien tableau (déjà
    // tout passé) et le statut restait bloqué sur "searching_alternative"
    // malgré la nouvelle date. RescheduleModal ne propose qu'une seule date à
    // la fois, donc on remplace tout le tableau par celle-ci.
    const { data: updated, error: updateError } = await supabase
      .from("bookings")
      .update({ requested_date: date, requested_dates: [date], message })
      .eq("id", bookingId)
      .select("id, requested_date, message, status")
      .maybeSingle()

    if (updateError) {
      console.error("BOOKING RESCHEDULE UPDATE ERROR:", updateError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    return NextResponse.json({ success: true, data: updated });

  } catch (error) {
    console.error("BOOKING RESCHEDULE ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
