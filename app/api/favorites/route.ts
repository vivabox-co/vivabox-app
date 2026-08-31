import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from "@/lib/services/supabase"
import { hashSessionToken } from "@/lib/utils/sessionToken"

const UNIQUE_VIOLATION = "23505"

// Table favorites (voir migration SQL fournie séparément — pas encore
// versionnée dans le repo, ce projet gère son schéma Supabase à la main) :
//   id uuid pk, activation_code_id uuid references activation_codes(id),
//   experience_id text, created_at timestamptz,
//   unique(activation_code_id, experience_id)

// Contrairement à resolveOwnedBooking (booking/[bookingId]/review), pas de
// 401 ici en l'absence de session : UIContext appelle GET /api/favorites sur
// TOUTES les pages, y compris avant activation, où une liste vide est une
// réponse légitime plutôt qu'une erreur.
async function resolveSession(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
                || req.cookies.get('vb_session')?.value;
  if (!token) return { activationCodeId: null }

  const supabase = getSupabase()

  const { data: session, error: sessionError } = await supabase
    .from("activation_sessions")
    .select("activation_code_id, expires_at, revoked_at")
    .eq("token_hash", hashSessionToken(token))
    .maybeSingle()

  if (sessionError) {
    console.error("FAVORITES SESSION ERROR:", sessionError)
    return { error: NextResponse.json({ success: false, error: "SERVER_ERROR" }) }
  }
  if (!session || session.revoked_at || new Date(session.expires_at) < new Date()) {
    return { activationCodeId: null }
  }

  return { supabase, activationCodeId: session.activation_code_id as string }
}

export async function GET(req: NextRequest) {
  try {
    const resolved = await resolveSession(req)
    if (resolved.error) return resolved.error
    if (!resolved.activationCodeId) {
      return NextResponse.json({ success: true, data: [] });
    }
    const { supabase, activationCodeId } = resolved

    const { data, error } = await supabase!
      .from("favorites")
      .select("experience_id")
      .eq("activation_code_id", activationCodeId)

    if (error) {
      console.error("FAVORITES GET ERROR:", error)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    return NextResponse.json({ success: true, data: data.map(f => f.experience_id) });

  } catch (error) {
    console.error("FAVORITES GET ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const resolved = await resolveSession(req)
    if (resolved.error) return resolved.error
    if (!resolved.activationCodeId) {
      return NextResponse.json({ success: false, error: "NO_SESSION" }, { status: 401 });
    }
    const { supabase, activationCodeId } = resolved

    const body = await req.json().catch(() => ({}));
    const experienceId = typeof body.experienceId === "string" ? body.experienceId : ""
    if (!experienceId) {
      return NextResponse.json({ success: false, error: "INVALID_INPUT" }, { status: 400 });
    }

    const { error } = await supabase!
      .from("favorites")
      .insert({ activation_code_id: activationCodeId, experience_id: experienceId })

    if (error && error.code !== UNIQUE_VIOLATION) {
      console.error("FAVORITES POST ERROR:", error)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("FAVORITES POST ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const resolved = await resolveSession(req)
    if (resolved.error) return resolved.error
    if (!resolved.activationCodeId) {
      return NextResponse.json({ success: false, error: "NO_SESSION" }, { status: 401 });
    }
    const { supabase, activationCodeId } = resolved

    const experienceId = req.nextUrl.searchParams.get("experienceId") || ""
    if (!experienceId) {
      return NextResponse.json({ success: false, error: "INVALID_INPUT" }, { status: 400 });
    }

    const { error } = await supabase!
      .from("favorites")
      .delete()
      .eq("activation_code_id", activationCodeId)
      .eq("experience_id", experienceId)

    if (error) {
      console.error("FAVORITES DELETE ERROR:", error)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("FAVORITES DELETE ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
