import { Experience, Category, Format } from "@/lib/data/types"

type Filters = {
  categories: Category[]
  formats: Format[]
  cities?: string[]
  ambiances?: string[]
  indoorState?: "indoor" | "outdoor" | "any"
}

export function filterExperiences(
  experiences: Experience[],
  filters: Filters
): Experience[] {
  return experiences.filter((exp) => {
    if (!filters.categories.includes(exp.category)) return false
    if (!filters.formats.includes(exp.format)) return false

    if (filters.cities?.length && !filters.cities.includes(exp.zone)) return false

    if (
      filters.ambiances?.length &&
      !exp.ambiance?.some((a) => filters.ambiances!.includes(a))
    ) return false

    if (filters.indoorState !== "any" && exp.environment !== filters.indoorState)
      return false

    return true
  })
}
