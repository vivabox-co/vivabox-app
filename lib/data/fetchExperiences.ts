import {
  Experience,
  Category,
  Format,
  ActivityKey,
  EffortLevel,
  Environment,
  DurationType,
} from "./types"
import { parseCSV } from "@/lib/utils/csv"
import { formatDuration } from "@/lib/format/duration"

// ------------------------------
// SHEET (source du catalogue — remplace l'ancien backend Apps Script,
// dont l'action "get_experiencias" n'existe plus côté script : voir
// fetchExperiencesFromSheet, utilisée à la fois ici en fallback client
// et côté serveur par /api/experiencias)
// ------------------------------
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS0wvZlSud-v8_n6IWeI6_qfWgmuViBjkp1-yHP-RJ90VlxhistJE2MuV0k_jc88cUeyOngtBI3ZdWM/pub?gid=1700161859&single=true&output=csv"

// Seules les lignes marquées ainsi dans la colonne `estado` sont publiables ;
// le reste du sheet est du contenu en brouillon (colonnes vides).
const PUBLISHED_STATUS = "listo para publicar"

const DEFAULT_FORMAT: Format = "solo"
const DEFAULT_CATEGORY: Category = "cultura"

/* ================= UTIL ================= */

function clean(value: string = "") {
  return value.replace(/^"|"$/g, "").replace(/\r/g, "").trim()
}

function toArray(value: string = "", separator = ","): string[] {
  return clean(value)
    .split(separator)
    .map((v) => v.trim())
    .filter(Boolean)
}

function toBool(value: string = ""): boolean {
  return clean(value).toLowerCase() === "true"
}

function toNumber(value: string = ""): number | undefined {
  const match = clean(value).match(/\d+/)
  return match ? Number(match[0]) : undefined
}

/* 🔥 Normalisation Sheet → code */
export function normalizeActivityKey(value: string): ActivityKey {
  return clean(value)
    .toLowerCase()
    .replace(/ /g, "")       // espace insécable Google
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

// Le sheet référence les photos sous "/images/..." mais le dossier réel
// dans ce repo est public/image/ (singulier) — /images/experiencias-reales/*
// → /image/experiencias-reales/*.
function toAssetPath(value: string = ""): string {
  const v = clean(value)
  return v.replace(/^\/images\//, "/image/")
}

/* ================= PARSING CSV (fallback) ================= */

function mapRow(row: Record<string, string>): Experience | null {
  const id = clean(row.codigo_interno)
  const lat = Number(clean(row.ubicacion_lat).replace(",", "."))
  const lng = Number(clean(row.ubicacion_lng).replace(",", "."))

  if (!id || Number.isNaN(lat) || Number.isNaN(lng)) {
    console.warn("⚠️ Ligne ignorée (id ou coordonnées invalides) :", id)
    return null
  }

  return {
    id,
    title: clean(row.nombre_experiencia),
    providerName: clean(row.proveedor_nombre) || clean(row.nombre_experiencia),
    category: normalizeCategory(row.categoria),
    activity_key: normalizeActivityKey(row.tipo_actividad),
    lat,
    lng,
    zone: clean(row.zona),
    city: clean(row.ciudad),
    duration: formatDuration(row.duracion_min) || "",
    durationType: clean(row.tipo_duracion) as DurationType,
    format: (clean(row.formato) as Format) || DEFAULT_FORMAT,
    image: toAssetPath(row.imagen) || "/images/placeholder.jpg",
    gallery: toArray(row.imagenes_adicionales, "|").map(toAssetPath),
    vivanote: clean(row.nota_vivabox),
    shortDescription: clean(row.descripcion_corta),
    // incluye est standardisé sur "·" depuis le 23/08/2026 (liste courte,
    // pas de virgules) précisément parce que certains éléments contiennent
    // eux-mêmes des virgules internes, ex. AVE-COR-004 :
    // "refrigerio (agua de panela, arepa, queso, almojábana)" — un seul
    // élément de la liste, qui casserait en 4 fragments avec un split ",".
    includes: toArray(row.incluye, "·"),
    requirements: toArray(row.requisitos),
    idealFor: toArray(row.ideal_para),
    effortLevel: clean(row.nivel_esfuerzo) as EffortLevel,
    weatherNote: clean(row.nota_clima),
    clothingNote: clean(row.nota_vestimenta),
    importantToKnow: toArray(row.info_importante),
    ambiance: toArray(row.ambiente_animo),
    environment: clean(row.entorno) as Environment,
    badges: toArray(row.claves_eleccion, "|"),
    providerPhone: clean(row.proveedor_telefono),
    needsPhone: toBool(row.requiere_telefono),
    needsPeopleCount: toBool(row.requiere_num_personas),
    extraPeopleOption: {
      allowed: toBool(row.permite_extra),
      maxExtraPeople: toNumber(row.max_personas_extra),
      requiresManualApproval: toBool(row.extra_requiere_aprobacion),
      note: clean(row.nota_extra) || undefined,
    },
  }
}

// Exportée : appelée aussi bien ici (fallback client) que côté serveur par
// /api/experiencias/route.ts, qui n'a plus de backend Apps Script à appeler.
export async function fetchExperiencesFromSheet(): Promise<Experience[]> {
  const res = await fetch(SHEET_CSV_URL, { cache: "no-store" })
  const text = await res.text()
  const rows = parseCSV(text)

  const data = rows
    .filter((row) => clean(row.estado).toLowerCase() === PUBLISHED_STATUS)
    .map(mapRow)

  return data.filter(isExperience)
}

/* ================= NOUVELLE FONCTION PRINCIPALE ================= */

// Le catalogue change rarement mais /api/experiencias est lent (~1.5-2s,
// backend Google Apps Script/Sheets), et plusieurs composants indépendants
// (page + MapView sur /mapa, etc.) appellent fetchExperiences() en même
// temps — sans ça chacun repaierait le coût complet. `cachedList` évite de
// re-fetch pendant CACHE_TTL_MS ; `inFlightRequest` fait que des appels
// concurrents pendant un chargement partagent la même requête au lieu d'en
// déclencher une par appelant.
const CACHE_TTL_MS = 2 * 60 * 1000
let cachedList: Experience[] | null = null
let cachedAt = 0
let inFlightRequest: Promise<Experience[]> | null = null

/**
 * Récupère la liste des expériences depuis l'API interne.
 * Si l'API échoue (non disponible ou erreur), utilise le fallback CSV
 * pour ne pas casser l'application pendant la migration.
 */
export async function fetchExperiences(): Promise<Experience[]> {
  if (cachedList && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedList
  }

  if (inFlightRequest) {
    return inFlightRequest
  }

  inFlightRequest = fetchExperiencesUncached().finally(() => {
    inFlightRequest = null
  })

  const data = await inFlightRequest
  cachedList = data
  cachedAt = Date.now()
  return data
}

async function fetchExperiencesUncached(): Promise<Experience[]> {
  try {
    const apiRes = await fetch("/api/experiencias", {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!apiRes.ok) {
      throw new Error(`API responded with status ${apiRes.status}`)
    }

    const json = await apiRes.json()

    // L'API doit retourner { success: true, data: Experience[] }
    if (json.success && Array.isArray(json.data)) {
      console.log("✅ Experiences chargées depuis l’API")
      return json.data
    }

    // Si l'API retourne un succès mais pas le bon format, on log et on fallback
    console.warn("⚠️ API réponse inattendue, fallback CSV", json)
    return await fetchExperiencesFromSheet()
  } catch (error) {
    console.error("❌ Erreur API /api/experiencias, fallback CSV :", error)
    // En attendant que l'API soit prête, on utilise l'ancienne méthode
    return await fetchExperiencesFromSheet()
  }
}
