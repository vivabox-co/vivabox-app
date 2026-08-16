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

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0wvZlSud-v8_n6IWeI6_qfWgmuViBjkp1-yHP-RJ90VlxhistJE2MuV0k_jc88cUeyOngtBI3ZdWM/pub?gid=1700161859&single=true&output=csv'

const PUBLISHED_STATUS = 'listo para publicar'

export async function loadExperiences(): Promise<RecoExperience[]> {
  const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' })
  const csv = await res.text()
  const rows = parseCSV(csv).filter(
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
