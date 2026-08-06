import type { SupabaseClient } from "@supabase/supabase-js"

// Enrobe la fonction Postgres check_rate_limit() (supabase/schema.sql, projet
// site vitrine) : compteur atomique, une ligne par (identifier, action).
export async function checkRateLimit(
  supabase: SupabaseClient,
  identifier: string,
  action: string,
  maxAttempts: number,
  windowMinutes: number
): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_identifier: identifier,
    p_action: action,
    p_max_attempts: maxAttempts,
    p_window_minutes: windowMinutes,
  })

  if (error) {
    console.error("RATE LIMIT CHECK ERROR:", error)
    return true // fail open — un rate limiter cassé ne doit jamais bloquer du trafic réel
  }

  return data === true
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return "unknown"
}
