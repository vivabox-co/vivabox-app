import { Experience, Category, Format, ActivityKey } from "@/lib/data/types"

export type ExperienceFilters = {
  categories: Category[]
  formats: Format[]
  cities?: string[]
  ambiances?: string[]
  indoorState?: "indoor" | "outdoor" | "any"
  searchText?: string
  activities?: ActivityKey[]   // 🔥 data-driven
}

export function filterExperiences(
  experiences: Experience[],
  filters: ExperienceFilters
) {
  const {
    categories,
    formats,
    cities = [],
    ambiances = [],
    indoorState = "any",
    searchText = "",
    activities = [],
  } = filters

  const text = searchText.toLowerCase().trim()

  const filteredExperiences = experiences.filter((exp) => {
    /* 🎯 CATÉGORIE */
    if (!categories.includes(exp.category)) return false

    /* 👥 FORMAT */
    if (!formats.includes(exp.format)) return false

    /* 🏙 VILLE */
    if (cities.length && (!exp.city || !cities.includes(exp.city))) return false

    /* 🌿 AMBIANCE */
    if (
      ambiances.length &&
      (!exp.ambiance || !exp.ambiance.some((a) => ambiances.includes(a)))
    )
      return false

    /* 🌤 ENVIRONNEMENT */
    if (
      indoorState !== "any" &&
      exp.environment &&
      exp.environment !== indoorState
    )
      return false

    /* 🐎 ACTIVITÉ */
    if (activities.length && !activities.includes(exp.activity_key))
      return false

    /* 🔍 RECHERCHE TEXTE */
    if (text) {
      const haystack = [
        exp.title,
        exp.shortDescription,
        exp.vivanote,
        exp.category,
        exp.city,
        exp.zone,
        exp.activity_key,
        ...(exp.ambiance || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      if (!haystack.includes(text)) return false
    }

    return true
  })

  /* 📊 COMPTEURS UI */

  const countsByCategory: Record<Category, number> = {
    gastro: 0,
    bienestar: 0,
    aventura: 0,
    cultura: 0,
    estancias: 0,
  }

  const countsByFormat: Record<Format, number> = {
    solo: 0,
    duo: 0,
    familia: 0,
  }

  const countsByActivity: Record<string, number> = {}

  filteredExperiences.forEach((exp) => {
    countsByCategory[exp.category]++
    countsByFormat[exp.format]++

    if (!countsByActivity[exp.activity_key]) {
      countsByActivity[exp.activity_key] = 0
    }
    countsByActivity[exp.activity_key]++
  })

  return {
    filteredExperiences,
    countsByCategory,
    countsByFormat,
    countsByActivity,
  }
}
