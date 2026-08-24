/* ================================
   🎨 CATÉGORIES & FORMAT
================================ */

export type Category =
  | "gastro"
  | "bienestar"
  | "aventura"
  | "cultura"
  | "estancias"

export type Format = "solo" | "duo"

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

// Doit correspondre au vocabulaire réel de la colonne nivel_esfuerzo du Sheet
// (bajo/medio/alto) — "suave/medio/intenso" ne matchait aucune ligne publiée,
// donc l'effort n'apparaissait jamais dans la fiche.
export type EffortLevel = "bajo" | "medio" | "alto"

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
  /* 🔹 IDENTITÉ (technique vs affichage) */
  id: string                    // ID technique stable (slug/uuid)
  title: string
  subtitle?: string

  providerName: string

  category: Category
  activity_key: ActivityKey

  /* 🔹 LOCALISATION */
  lat: number
  lng: number
  zone: string
  city?: string
  distance?: string

  /* 🔹 MÉTA RAPIDE (cards) */
  duration: string
  durationType?: DurationType
  format: Format

  image: string                 // image principale
  gallery?: string[]            // images secondaires (fiche)

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

  // Versión estructurada de requisitos/info_importante/nota_clima/nota_vestimenta
  // (ver fetchExperiences.ts): usa las columnas explícitas del Sheet
  // (requisitos_excluyentes/recomendaciones/aviso_previo/clima_afecta/
  // ropa_especial) cuando existen, y cae de vuelta a la misma heurística de
  // texto libre que requirements/weatherNote/etc. para filas del Sheet
  // todavía no migradas a las columnas nuevas.
  requisitosExcluyentes: string[]
  recomendaciones: string[]
  avisoPrevio: string[]

  /* 🔴 FILTRAGE INTELLIGENT */
  ambiance?: string[]
  environment?: Environment

  // Claves editoriales (col. claves_eleccion, ex-badges_visibles — renommée
  // le 23/08/2026 côté sheet : règle éditoriale resserrée à 2-3 infos qui
  // influencent vraiment la décision, plutôt vide que générique), hasta 3
  // por fila. No son un sistema de restricciones — mezclan highlights
  // (chimenea, con_chef) con datos ya mostrados en otra sección (esfuerzo_alto,
  // al_aire_libre); ver BADGE_LABELS/EXCLUDED_BADGE_KEYS en ExperienceExploreMeta.
  badges?: string[]

  /* 🔑 DONNÉES UTILISÉES APRÈS CONFIRMATION */
  address?: string              // affiché après confirmation
  meetingPointNote?: string
  providerPhone?: string

  /* 🔴 LOGIQUE RÉSERVATION */
  needsPhone: boolean
  needsPeopleCount: boolean
  extraPeopleOption?: ExtraPersonOption
}
