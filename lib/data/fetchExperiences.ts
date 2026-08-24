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

/* ================= TEN EN CUENTA (requisitos_excluyentes / recomendaciones / aviso_previo) =================
 *
 * El Sheet soporta dos esquemas para "qué debe saber el beneficiario antes
 * de elegir": las columnas nuevas y explícitas (requisitos_excluyentes,
 * recomendaciones, aviso_previo, clima_afecta, ropa_especial), y el esquema
 * legado (una sola columna `requisitos`/`info_importante` en texto libre que
 * mezcla exclusiones duras con recomendaciones blandas, y `nota_clima`/
 * `nota_vestimenta` con la convención manual "Influye: "/"No influye").
 * mapRow() usa las columnas nuevas cuando la fila ya fue migrada, y cae de
 * vuelta a la heurística de texto libre para las filas que no.
 */

// Separa frases dentro de una celda por puntuación de fin de oración — NO por
// coma, porque una sola frase real puede contener comas internas (ej. "No
// apto para personas con vértigo, problemas cardíacos o de columna."), que
// un split por "," rompería en dos fragmentos sin sentido.
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

// Heurística de texto para el esquema legado: separa, dentro de una lista de
// frases, las exclusiones duras (pueden impedir elegir la experiencia) de
// los avisos que hay que comunicar antes de reservar, y deja el resto como
// recomendación blanda.
const HARD_CONSTRAINT_RE = /no apto|mayor de \d+|licencia/i
const DISCLOSURE_RE = /^avisar\b/i

function classifyLegacySentences(sentences: string[]): {
  hard: string[]
  soft: string[]
  aviso: string[]
} {
  const hard: string[] = []
  const soft: string[] = []
  const aviso: string[] = []
  sentences.forEach((sentence) => {
    if (HARD_CONSTRAINT_RE.test(sentence)) hard.push(sentence)
    else if (DISCLOSURE_RE.test(sentence)) aviso.push(sentence)
    else soft.push(sentence)
  })
  return { hard, soft, aviso }
}

// Quita el prefijo editorial "Influye: " del esquema legado (marca interna
// para que isRelevantNote pueda filtrar "No influye") — no es lenguaje para
// el beneficiario.
function stripInfluencePrefix(note: string): string {
  const stripped = note.replace(/^\s*influye\s*:?\s*/i, "").trim()
  // nota_vestimenta se escribe en el Sheet como frase nominal en minúscula
  // pensada para leerse después de "Influye: " (ej. "ropa cómoda y calzado
  // cerrado") — al quitar el prefijo queda como oración suelta y sin
  // mayúscula inicial, así que se capitaliza para que combine con el resto
  // de líneas de la lista (que sí son oraciones completas).
  return stripped.charAt(0).toUpperCase() + stripped.slice(1)
}

// Esquema legado: "No influye"/"No aplica" es una nota real (alguien la
// verificó) pero no debe llegar al beneficiario — no cambia su decisión, es
// el mismo ruido que una celda vacía.
function isRelevantNote(note: string): boolean {
  return !!note && !/^no (influye|aplica)/i.test(note.trim())
}

const DEDUPE_STOPWORDS = new Set([
  "de", "la", "el", "los", "las", "para", "al", "en", "con", "y", "o",
  "un", "una", "que", "se", "es", "si", "hay", "por", "del", "su", "tu",
  "lo", "más", "muy", "no", "sin", "llevar", "traer",
])

function wordsForCompare(text: string): Set<string> {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
  return new Set(
    normalized.split(/\s+/).filter((w) => w && !DEDUPE_STOPWORDS.has(w))
  )
}

function wordOverlapRatio(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let common = 0
  a.forEach((w) => {
    if (b.has(w)) common++
  })
  return common / Math.min(a.size, b.size)
}

// requisitos/info_importante y nota_clima/nota_vestimenta no se coordinan
// entre sí en el esquema legado — la misma recomendación puede quedar
// redactada dos veces con palabras distintas en dos columnas. Se compara por
// solapamiento de palabras (no texto exacto) y se conserva la primera
// aparición.
const DEDUPE_SIMILARITY_THRESHOLD = 0.6

function dedupeSimilar(items: string[]): string[] {
  const kept: { text: string; words: Set<string> }[] = []
  items.forEach((item) => {
    const words = wordsForCompare(item)
    const isDuplicate = kept.some(
      (k) => wordOverlapRatio(k.words, words) >= DEDUPE_SIMILARITY_THRESHOLD
    )
    if (!isDuplicate) kept.push({ text: item, words })
  })
  return kept.map((k) => k.text)
}

function deriveTenEnCuenta(row: Record<string, string>): {
  requisitosExcluyentes: string[]
  recomendaciones: string[]
  avisoPrevio: string[]
} {
  const newExcluyentes = clean(row.requisitos_excluyentes)
  const newRecomendaciones = clean(row.recomendaciones)
  const newAviso = clean(row.aviso_previo)
  const hasNewRequisitosSchema = !!(newExcluyentes || newRecomendaciones || newAviso)

  let requisitosExcluyentes: string[]
  let recomendacionesSoft: string[]
  let avisoPrevio: string[]

  if (hasNewRequisitosSchema) {
    requisitosExcluyentes = splitSentences(newExcluyentes)
    recomendacionesSoft = splitSentences(newRecomendaciones)
    avisoPrevio = splitSentences(newAviso)
  } else {
    const classified = classifyLegacySentences([
      ...splitSentences(clean(row.requisitos)),
      ...splitSentences(clean(row.info_importante)),
    ])
    requisitosExcluyentes = classified.hard
    recomendacionesSoft = classified.soft
    avisoPrevio = classified.aviso
  }

  const hasNewClimaSchema = clean(row.clima_afecta) !== ""
  const climaAfecta = hasNewClimaSchema
    ? toBool(row.clima_afecta)
    : isRelevantNote(clean(row.nota_clima))
  const climaText = climaAfecta
    ? hasNewClimaSchema
      ? clean(row.nota_clima)
      : stripInfluencePrefix(clean(row.nota_clima))
    : ""

  const hasNewRopaSchema = clean(row.ropa_especial) !== ""
  const ropaEspecial = hasNewRopaSchema
    ? toBool(row.ropa_especial)
    : isRelevantNote(clean(row.nota_vestimenta))
  const ropaText = ropaEspecial
    ? hasNewRopaSchema
      ? clean(row.nota_vestimenta)
      : stripInfluencePrefix(clean(row.nota_vestimenta))
    : ""

  const recomendaciones = dedupeSimilar(
    [...recomendacionesSoft, climaText, ropaText].filter(Boolean)
  )

  return { requisitosExcluyentes, recomendaciones, avisoPrevio }
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

  const { requisitosExcluyentes, recomendaciones, avisoPrevio } = deriveTenEnCuenta(row)

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
    // splitSentences (no toArray/",") a propósito: una sola frase real puede
    // contener comas internas (ej. AVE-COR-003 "No apto para personas con
    // vértigo, problemas cardíacos o de columna."), que un split por ","
    // rompería en dos fragmentos sin sentido.
    requirements: splitSentences(clean(row.requisitos)),
    idealFor: toArray(row.ideal_para),
    effortLevel: clean(row.nivel_esfuerzo) as EffortLevel,
    weatherNote: clean(row.nota_clima),
    clothingNote: clean(row.nota_vestimenta),
    importantToKnow: toArray(row.info_importante),
    requisitosExcluyentes,
    recomendaciones,
    avisoPrevio,
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
