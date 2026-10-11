// Catalogue d'expériences côté serveur: Supabase d'abord (experiences + providers,
// via catalog.ts), repli sur le CSV publié du Sheet tant qu'il n'est pas coupé.
// Serveur uniquement (clé service_role) — ne pas importer depuis un composant client.
import { experiencesFromRows, fetchExperiencesFromSheet } from "@/lib/data/fetchExperiences"
import { fetchCatalogRows } from "./catalog"
import { getSupabase } from "./supabase"
import type { Experience } from "@/lib/data/types"

export async function loadPublishedExperiences(): Promise<Experience[]> {
  try {
    const rows = await fetchCatalogRows(getSupabase(), "public")
    const data = experiencesFromRows(rows)
    if (data.length > 0) return data
    console.warn("[catalog] Supabase a renvoyé 0 expérience, repli sur le CSV publié")
  } catch (error) {
    console.warn("[catalog] Supabase indisponible, repli sur le CSV publié :", error)
  }
  return fetchExperiencesFromSheet()
}
