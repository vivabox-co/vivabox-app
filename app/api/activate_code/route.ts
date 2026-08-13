import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/services/supabase"
import { normalizeCode } from "@/lib/utils/normalizeCode"
import { isValidEmail } from "@/lib/utils/isValidEmail"
import { checkRateLimit, getClientIp } from "@/lib/utils/rateLimit"
import { generateSessionToken, hashSessionToken } from "@/lib/utils/sessionToken"
import { SESSION_VALIDITY_DAYS } from "@/lib/constants/session"

const RATE_LIMIT_MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MINUTES = 15
const GLOBAL_RATE_LIMIT_MAX_ATTEMPTS = 100
const GLOBAL_RATE_LIMIT_WINDOW_MINUTES = 10

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const codeInput = typeof body.codigo === "string" ? body.codigo : ""
    const name = typeof body.nombre === "string" ? body.nombre.trim().slice(0, 100) : ""
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 100) : ""

    if (!codeInput || !name || !email) {
      return NextResponse.json({ success: false, error: "INVALID_INPUT" })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "INVALID_EMAIL" })
    }

    const normalizedCode = normalizeCode(codeInput)
    const supabase = getSupabase()
    const ip = getClientIp(req)

    function rejected(error: string) {
      console.warn(`ACTIVATE REJECTED: ${error} ip=${ip} code=${normalizedCode}`)
      return NextResponse.json({ success: false, error })
    }

    const [ipAllowed, codeAllowed, globalAllowed] = await Promise.all([
      checkRateLimit(supabase, `ip:${ip}`, "activate", RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW_MINUTES),
      checkRateLimit(supabase, `code:${normalizedCode}`, "activate", RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW_MINUTES),
      checkRateLimit(supabase, "global", "activate", GLOBAL_RATE_LIMIT_MAX_ATTEMPTS, GLOBAL_RATE_LIMIT_WINDOW_MINUTES),
    ])

    if (!ipAllowed || !codeAllowed || !globalAllowed) {
      return rejected("TOO_MANY_ATTEMPTS")
    }

    // Une seule mise à jour conditionnelle, atomique : impossible d'activer
    // deux fois le même code même sous requêtes concurrentes.
    const { data: activated, error: updateError } = await supabase
      .from("activation_codes")
      .update({
        status: "activated",
        beneficiary_name: name,
        beneficiary_email: email,
        activated_at: new Date().toISOString(),
      })
      .eq("code_normalized", normalizedCode)
      .eq("status", "unused")
      .gt("expires_at", new Date().toISOString())
      .select("id")
      .maybeSingle()

    if (updateError) {
      console.error("ACTIVATE UPDATE ERROR:", updateError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" })
    }

    if (!activated) {
      const { data: existing } = await supabase
        .from("activation_codes")
        .select("status, expires_at")
        .eq("code_normalized", normalizedCode)
        .maybeSingle()

      if (!existing) {
        return rejected("INVALID")
      }

      if (existing.status === "activated") {
        return rejected("ALREADY_ACTIVATED")
      }

      if (new Date(existing.expires_at) < new Date()) {
        return rejected("EXPIRED")
      }

      return rejected("INVALID")
    }

    const token = generateSessionToken()
    const expiresAt = new Date(Date.now() + SESSION_VALIDITY_DAYS * 24 * 60 * 60 * 1000).toISOString()

    const { error: sessionError } = await supabase
      .from("activation_sessions")
      .insert({
        activation_code_id: activated.id,
        token_hash: hashSessionToken(token),
        expires_at: expiresAt,
      })

    if (sessionError) {
      console.error("SESSION INSERT ERROR:", sessionError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" })
    }

    const response = NextResponse.json({ success: true, data: { token, expiresAt, codigo: normalizedCode } })
    response.cookies.set("vb_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(expiresAt),
      path: "/",
    })
    return response

  } catch (err) {
    console.error("ACTIVATE API ERROR:", err)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" })
  }
}
