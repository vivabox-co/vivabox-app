import { Experience, Category, ActivityKey } from "@/lib/data/types"

export type ActivityFilterGroup = {
  category: Category
  activities: ActivityKey[]
}

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

  experiences.forEach((exp) => {
    map[exp.category].add(exp.activity_key)
  })

  return Object.entries(map).map(([category, set]) => ({
    category: category as Category,
    activities: Array.from(set),
  }))
}
