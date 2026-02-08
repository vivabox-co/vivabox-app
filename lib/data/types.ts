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
 * activity_key correspond EXACTEMENT
 * aux fichiers SVG dans /public/icons
 * et à la colonne "activity_key" du Google Sheet
 */
export type ActivityKey =
  | "archery"
  | "art_workshop"
  | "bbq"
  | "beer_tasting"
  | "brunch"
  | "buggy"
  | "bungee"
  | "caravan"
  | "chef-hat"
  | "cinema"
  | "climbing"
  | "coffee_tasting"
  | "dining"
  | "driving_track"
  | "eco_lodge"
  | "escape_room"
  | "facial"
  | "flight_plane"
  | "glass"
  | "glamping"
  | "golf"
  | "hair"
  | "hiking"
  | "horseback"
  | "hotel_stay"
  | "ice_bath"
  | "karting"
  | "massage"
  | "meditation"
  | "motorbike"
  | "paragliding"
  | "perfume"
  | "photoshoot"
  | "pizza_class"
  | "sauna"
  | "scuba"
  | "skydive"
  | "spa"
  | "sushi_class"
  | "theater"
  | "wind_tunnel"

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
  id: string                     // 🔥 = nom du prestataire
  title: string
  subtitle?: string

  category: Category
  activity_key: ActivityKey

  /* 🔹 LOCALISATION */
  lat: number
  lng: number
  zone: string
  distance?: string
  city?: string                  // 🔥 Filtrage ville

  /* 🔹 MÉTA RAPIDE (cards) */
  duration: string
  durationType?: DurationType    // 🔥 Filtrage mental
  format: Format
  image: string
  vivanote: string

  /* 🔴 CONTENU PRODUIT (drawer explore) */
  shortDescription: string
  includes: string[]
  requirements?: string[]
  idealFor?: string[]
  effortLevel?: EffortLevel
  weatherNote?: string
  clothingNote?: string
  importantToKnow?: string[]

  /* 🔴 FILTRAGE INTELLIGENT */
  ambiance?: string[]            // ex: ["relax","romántico"]
  environment?: Environment

  /* 🔴 LOGIQUE RÉSERVATION */
  needsPhone: boolean
  needsPeopleCount: boolean
  extraPeopleOption?: ExtraPersonOption
}
