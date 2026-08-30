import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from "@/lib/services/supabase"
import { hashSessionToken } from "@/lib/utils/sessionToken"

// Utilisée uniquement par l'action "Cambiar" de l'étape 2 de réservation
// (voir app/reservar/fechas/confirmar/page.tsx) pour corriger le nom déjà
// saisi à l'activation — jamais pour re-proposer un formulaire d'activation.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
                  || req.cookies.get('vb_session')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "NO_TOKEN" }, { status: 401 });
    }

    const name = typeof body.nombre === "string" ? body.nombre.trim().slice(0, 100) : ""
    if (!name) {
      return NextResponse.json({ success: false, error: "INVALID_INPUT" });
    }

    const supabase = getSupabase()

    const { data: session, error: sessionError } = await supabase
      .from("activation_sessions")
      .select("activation_code_id, expires_at, revoked_at")
      .eq("token_hash", hashSessionToken(token))
      .maybeSingle()

    if (sessionError) {
      console.error("BENEFICIARY UPDATE SESSION ERROR:", sessionError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    if (!session || session.revoked_at || new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "INVALID_SESSION" });
    }

    const { error: updateError } = await supabase
      .from("activation_codes")
      .update({ beneficiary_name: name })
      .eq("id", session.activation_code_id)

    if (updateError) {
      console.error("BENEFICIARY UPDATE ERROR:", updateError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    return NextResponse.json({ success: true, data: { beneficiaryName: name } });

  } catch (error) {
    console.error("BENEFICIARY UPDATE ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
