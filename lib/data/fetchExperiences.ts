import {
  Experience,
  Category,
  Format,
  ActivityKey,
  EffortLevel,
  Environment,
  DurationType,
} from "./types"

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR4Jf6eOcGsbnRYIPVP60JVWDp1KkqZMGdcj3t8ABR9hdaFY9t3bLcvqgVjTVWVtz9GFUDtWADB_iLx/pub?gid=467010857&single=true&output=csv"

const DEFAULT_FORMAT: Format = "solo"
const DEFAULT_CATEGORY: Category = "cultura"

/* ================= UTIL ================= */

function clean(value: string = "") {
  return value.replace(/^"|"$/g, "").replace(/\r/g, "").trim()
}

function toArray(value: string = ""): string[] {
  return clean(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
}

function toBool(value: string = ""): boolean {
  return clean(value).toLowerCase() === "true"
}

function toNumber(value: string = ""): number | undefined {
  const n = Number(clean(value))
  return Number.isNaN(n) ? undefined : n
}

/* 🔥 Normalisation Sheet → code */

function normalizeActivityKey(value: string): ActivityKey {
  return clean(value)
    .toLowerCase()
    .replace(/\u00A0/g, "")       // espace insécable Google
    .replace(/[ -]+/g, "_")      // "chef hat" → chef_hat
    .replace(/[^\w_]/g, "")      // supprime accents / symboles
    .trim() as ActivityKey
}

function normalizeCategory(value: string): Category {
  const v = clean(value).toLowerCase()
  if (["gastro","bienestar","aventura","cultura","estancias"].includes(v)) {
    return v as Category
  }
  console.warn("⚠️ catégorie inconnue → fallback cultura :", v)
  return DEFAULT_CATEGORY
}

function isExperience(exp: Experience | null): exp is Experience {
  return exp !== null
}

/* ================= FETCH ================= */

export async function fetchExperiences(): Promise<Experience[]> {
  const res = await fetch(SHEET_URL, { cache: "no-store" })
  const text = await res.text()

  const lines = text.split("\n").slice(1)

  const data = lines.map((line, index): Experience | null => {
    const cols = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)

    if (!cols || cols.length < 30) {
      console.warn("⚠️ Ligne ignorée", index + 2)
      return null
    }

    const lat = Number(clean(cols[4]).replace(",", "."))
    const lng = Number(clean(cols[5]).replace(",", "."))

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      console.warn("⚠️ Coordonnées invalides ligne", index + 2)
      return null
    }

    const activityKey = normalizeActivityKey(cols[3])

    return {
      /* 🔹 IDENTITÉ */
      id: clean(cols[0]),
      title: clean(cols[1]),
      providerName: clean(cols[30]) || clean(cols[1]),
      category: normalizeCategory(cols[2]),
      activity_key: activityKey,
  

      /* 🔹 LOCALISATION */
      lat,
      lng,
      zone: clean(cols[8]),
      distance: clean(cols[9]),
      city: clean(cols[26]),

      /* 🔹 MÉTA RAPIDE */
      duration: clean(cols[6]),
      durationType: clean(cols[29]) as DurationType,
      format: (clean(cols[7]) as Format) || DEFAULT_FORMAT,
      image: clean(cols[10]) || "/images/placeholder.jpg",
      vivanote: clean(cols[11]),

      /* 🔴 CONTENU PRODUIT */
      shortDescription: clean(cols[12]),
      includes: toArray(cols[13]),
      requirements: toArray(cols[14]),
      idealFor: toArray(cols[15]),
      effortLevel: clean(cols[16]) as EffortLevel,
      weatherNote: clean(cols[17]),
      clothingNote: clean(cols[18]),
      importantToKnow: toArray(cols[19]),

      /* 🔴 FILTRAGE */
      ambiance: toArray(cols[27]),
      environment: clean(cols[28]) as Environment,

      /* 🔴 RÉSERVATION */
      needsPhone: toBool(cols[20]),
      needsPeopleCount: toBool(cols[21]),

      extraPeopleOption: {
        allowed: toBool(cols[22]),
        maxExtraPeople: toNumber(cols[23]),
        requiresManualApproval: toBool(cols[24]),
        note: clean(cols[25]),
      },
    }
  })

  return data.filter(isExperience)
}
