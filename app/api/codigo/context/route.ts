import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from "@/lib/services/supabase"
import { hashSessionToken } from "@/lib/utils/sessionToken"

// estado renvoyé au middleware, dans le vocabulaire historique (ère Google
// Sheets) qu'il attend déjà : Activada / Reservada / Confirmada.
type Estado = "Activada" | "Reservada" | "Confirmada"

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

    const { data: activationCode, error: codeError } = await supabase
      .from("activation_codes")
      .select("status")
      .eq("id", session.activation_code_id)
      .maybeSingle()

    if (codeError || !activationCode || activationCode.status !== "activated") {
      return NextResponse.json({ success: false, error: "NOT_ACTIVATED" });
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("activation_code_id", session.activation_code_id)
      .in("status", ["requested", "confirmed", "completed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (bookingError) {
      console.error('Error in /api/codigo/context (booking):', bookingError);
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    let estado: Estado = "Activada"
    if (booking?.status === "requested") estado = "Reservada"
    if (booking?.status === "confirmed" || booking?.status === "completed") estado = "Confirmada"

    return NextResponse.json({
      success: true,
      data: { estado, booking_id: booking?.id ?? null },
    });

  } catch (error) {
    console.error('Error in /api/codigo/context:', error);
    return NextResponse.json({ success: false, error: "SERVER_ERROR" });
  }
}
