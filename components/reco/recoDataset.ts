// components/reco/recoDataset.ts

import {
  RecoExperience,
  Engagement,
  CalmaTipo,
  ParticipacionTipo,
  SacudidaTipo,
  Resolucion
} from './recoTypes'
import { parseCSV } from '@/lib/utils/csv'
import { normalizeActivityKey } from '@/lib/data/fetchExperiences'

// Repli uniquement (tant que le CSV publié n'est pas coupé). La source
// principale est /api/reco-dataset, qui lit Supabase côté serveur.
const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0wvZlSud-v8_n6IWeI6_qfWgmuViBjkp1-yHP-RJ90VlxhistJE2MuV0k_jc88cUeyOngtBI3ZdWM/pub?gid=1700161859&single=true&output=csv'

const PUBLISHED_STATUS = 'listo para publicar'

// Pure: lignes au format du Sheet (CSV ou Supabase via services/catalog.ts)
// -> expériences pour le moteur de recommandation.
export function recoFromRows(allRows: Record<string, string>[]): RecoExperience[] {
  const rows = allRows.filter(
    row => row.estado?.trim().toLowerCase() === PUBLISHED_STATUS
  )

  return rows.map(row => ({
  id: row.codigo_interno,
  activity_key: normalizeActivityKey(row.tipo_actividad),
  engagement: row.ritmo as Engagement,

  calma_tipo: row.tipo_calma
    ? (row.tipo_calma as CalmaTipo)
    : undefined,

  participacion_tipo: row.tipo_participacion
    ? (row.tipo_participacion as ParticipacionTipo)
    : undefined,

  sacudida_tipo: row.tipo_sacudida
    ? (row.tipo_sacudida as SacudidaTipo)
    : undefined,

  resolucion: row.resolucion
    ? (row.resolucion as Resolucion)
    : undefined,
})) as RecoExperience[]
}

export async function loadExperiences(): Promise<RecoExperience[]> {
  try {
    const res = await fetch('/api/reco-dataset', { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data as RecoExperience[]
      }
    }
  } catch (error) {
    console.warn('[reco] /api/reco-dataset indisponible, repli sur le CSV publié :', error)
  }

  const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' })
  const csv = await res.text()
  return recoFromRows(parseCSV(csv))
}
