import { Experience, Category, ActivityKey } from "@/lib/data/types"

/**
 * Structure attendue par FiltersDrawer
 */
export type ActivityFilterGroup = {
  category: Category
  activities: ActivityKey[]
}

/**
 * Ordre visuel stable des catégories
 */
const CATEGORY_ORDER: Category[] = [
  "gastro",
  "bienestar",
  "aventura",
  "cultura",
  "estancias",
]

/**
 * Construit dynamiquement les activités disponibles
 * par catégorie, à partir des expériences du sheet
 *
 * ✅ Auto-adaptatif si le sheet change
 * ✅ Évite les doublons
 * ✅ Conserve l'ordre des catégories produit
 */
export function buildActivityFilters(
  experiences: Experience[]
): ActivityFilterGroup[] {

  const map: Record<Category, Set<ActivityKey>> = {
    gastro: new Set(),
    bienestar: new Set(),
    aventura: new Set(),
    cultura: new Set(),
    estancias: new Set(),
  }

  // Collecte des activity_key
  experiences.forEach((exp) => {
    map[exp.category].add(exp.activity_key)
  })

  // Transformation en tableau exploitable par l’UI
  return CATEGORY_ORDER.map((category) => ({
    category,
    activities: Array.from(map[category]).sort(),
  })).filter(group => group.activities.length > 0)
}
