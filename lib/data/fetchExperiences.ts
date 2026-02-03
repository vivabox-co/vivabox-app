import { Experience, Category, Format, ActivityKey } from "./types"

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR4Jf6eOcGsbnRYIPVP60JVWDp1KkqZMGdcj3t8ABR9hdaFY9t3bLcvqgVjTVWVtz9GFUDtWADB_iLx/pub?gid=467010857&single=true&output=csv"

const DEFAULT_ACTIVITY_KEY: ActivityKey = "golf"
const DEFAULT_FORMAT: Format = "solo"
const DEFAULT_CATEGORY: Category = "cultura"

function clean(value: string = "") {
  return value.replace(/^"|"$/g, "").trim()
}

function isExperience(exp: Experience | null): exp is Experience {
  return exp !== null
}

export async function fetchExperiences(): Promise<Experience[]> {
  const res = await fetch(SHEET_URL, { cache: "no-store" })
  const text = await res.text()

  const lines = text.split("\n").slice(1)

  const data = lines.map((line, index): Experience | null => {
    const cols = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)

    if (!cols || cols.length < 12) {
      console.warn("Ligne ignorée", index + 2)
      return null
    }

    const lat = Number(clean(cols[4]).replace(",", "."))
    const lng = Number(clean(cols[5]).replace(",", "."))

    if (Number.isNaN(lat) || Number.isNaN(lng)) return null

    return {
      id: clean(cols[0]),
      title: clean(cols[1]),
      category: (clean(cols[2]) as Category) || DEFAULT_CATEGORY,

      // 🔥 LA LIGNE QUI MANQUAIT
      activity_key:
        (clean(cols[3]) as ActivityKey) || DEFAULT_ACTIVITY_KEY,

      lat,
      lng,
      duration: clean(cols[6]),
      format: (clean(cols[7]) as Format) || DEFAULT_FORMAT,
      zone: clean(cols[8]),
      distance: clean(cols[9]),
      image: clean(cols[10]) || "/images/placeholder.jpg",
      vivanote: clean(cols[11]),
    }
  })

  return data.filter(isExperience)
}
