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

// Pour un destinataire déjà activé qui a perdu sa session (nouvel appareil,
// cache vidé...) : redonne un token contre code + email déjà enregistrés.
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const codeInput = typeof body.codigo === "string" ? body.codigo : ""
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 100) : ""

    if (!codeInput || !email || !isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "INVALID_INPUT" })
    }

    const normalizedCode = normalizeCode(codeInput)
    const supabase = getSupabase()
    const ip = getClientIp(req)

    function rejected(error: string) {
      console.warn(`VERIFY REJECTED: ${error} ip=${ip} code=${normalizedCode}`)
      return NextResponse.json({ success: false, error })
    }

    const [ipAllowed, codeAllowed, globalAllowed] = await Promise.all([
      checkRateLimit(supabase, `ip:${ip}`, "verify", RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW_MINUTES),
      checkRateLimit(supabase, `code:${normalizedCode}`, "verify", RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW_MINUTES),
      checkRateLimit(supabase, "global", "verify", GLOBAL_RATE_LIMIT_MAX_ATTEMPTS, GLOBAL_RATE_LIMIT_WINDOW_MINUTES),
    ])

    if (!ipAllowed || !codeAllowed || !globalAllowed) {
      return rejected("TOO_MANY_ATTEMPTS")
    }

    const { data: activationCode, error: fetchError } = await supabase
      .from("activation_codes")
      .select("id, status, beneficiary_email")
      .eq("code_normalized", normalizedCode)
      .maybeSingle()

    if (fetchError) {
      console.error("VERIFY FETCH ERROR:", fetchError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" })
    }

    if (!activationCode) {
      return rejected("INVALID")
    }

    if (activationCode.status !== "activated") {
      return rejected("NOT_ACTIVATED")
    }

    if (activationCode.beneficiary_email !== email) {
      return rejected("EMAIL_MISMATCH")
    }

    const token = generateSessionToken()
    const expiresAt = new Date(Date.now() + SESSION_VALIDITY_DAYS * 24 * 60 * 60 * 1000).toISOString()

    const { error: sessionError } = await supabase
      .from("activation_sessions")
      .insert({
        activation_code_id: activationCode.id,
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
    console.error("VERIFY API ERROR:", err)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" })
  }
}
