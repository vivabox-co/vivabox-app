import { createClient, SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

// Créé paresseusement, au premier appel dans un handler — pas au chargement
// du module, pour que le build ne casse pas si SUPABASE_URL n'est pas encore
// configurée. Même projet Supabase que le site vitrine (voir docs/05_technical.md
// côté vivabox site).
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
  }
  return client
}
