/* ================================
   🎨 CATÉGORIES & FORMAT
================================ */

export type Category =
  | "gastro"
  | "bienestar"
  | "aventura"
  | "cultura"
  | "estancias"

export type Format = "solo" | "duo" | "familia"

/**
 * 🔥 activity_key est DATA-DRIVEN
 * Provient du Google Sheet
 * Correspond aux SVG dans /public/icons
 * MAIS on ne le fige PAS côté code
 */
export type ActivityKey = string

/* ================================
   🔥 NOUVEAUX TYPES PRODUIT
================================ */

export type EffortLevel = "suave" | "medio" | "intenso"

export type Environment = "indoor" | "outdoor" | "mixto"

export type DurationType = "corta" | "media" | "larga"

type ExtraPersonOption = {
  allowed: boolean
  maxExtraPeople?: number
  requiresManualApproval?: boolean
  note?: string
}

/* ================================
   🎯 EXPERIENCE VIVABOX (PRODUIT)
================================ */

export type Experience = {
  /* 🔹 IDENTITÉ */
  id: string                  // 🔥 = nom prestataire
  title: string
  subtitle?: string

  category: Category
  activity_key: ActivityKey  // 🔥 dynamique

  /* 🔹 LOCALISATION */
  lat: number
  lng: number
  zone: string
  distance?: string
  city?: string               // 🔥 filtre ville depuis sheet

  /* 🔹 MÉTA RAPIDE (cards) */
  duration: string
  durationType?: DurationType
  format: Format
  image: string
  vivanote: string

  /* 🔴 CONTENU PRODUIT */
  shortDescription: string
  includes: string[]
  requirements?: string[]
  idealFor?: string[]
  effortLevel?: EffortLevel
  weatherNote?: string
  clothingNote?: string
  importantToKnow?: string[]

  /* 🔴 FILTRAGE INTELLIGENT */
  ambiance?: string[]
  environment?: Environment

  /* 🔴 LOGIQUE RÉSERVATION */
  needsPhone: boolean
  needsPeopleCount: boolean
  extraPeopleOption?: ExtraPersonOption
}
