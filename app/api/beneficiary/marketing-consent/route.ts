import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from "@/lib/services/supabase"
import { hashSessionToken } from "@/lib/utils/sessionToken"

// Consentimiento opcional para WhatsApp/SMS, pedido después de confirmar una
// reserva (ver app/reservar/fechas/confirmacion/page.tsx) — separado del
// WhatsApp de coordinación logística pedido en /reservar/fechas/confirmar,
// que solo sirve a esa reserva puntual y no implica consentimiento de
// marketing (ese número ni siquiera se guarda de forma estructurada, ver
// app/api/booking/route.ts).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
                  || req.cookies.get('vb_session')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "NO_TOKEN" }, { status: 401 });
    }

    const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 30) : ""
    const consent = body.consent === true

    if (!phone || !consent) {
      return NextResponse.json({ success: false, error: "INVALID_INPUT" });
    }

    const supabase = getSupabase()

    const { data: session, error: sessionError } = await supabase
      .from("activation_sessions")
      .select("activation_code_id, expires_at, revoked_at")
      .eq("token_hash", hashSessionToken(token))
      .maybeSingle()

    if (sessionError) {
      console.error("MARKETING CONSENT SESSION ERROR:", sessionError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    if (!session || session.revoked_at || new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "INVALID_SESSION" });
    }

    const { error: updateError } = await supabase
      .from("activation_codes")
      .update({
        beneficiary_phone: phone,
        marketing_consent: true,
        marketing_consent_at: new Date().toISOString(),
      })
      .eq("id", session.activation_code_id)

    if (updateError) {
      console.error("MARKETING CONSENT UPDATE ERROR:", updateError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("MARKETING CONSENT ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
