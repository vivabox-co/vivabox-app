// components/reco/recoDataset.ts

import {
  RecoExperience,
  Engagement,
  CalmaTipo,
  ParticipacionTipo,
  SacudidaTipo,
  Resolucion
} from './recoTypes'

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR4Jf6eOcGsbnRYIPVP60JVWDp1KkqZMGdcj3t8ABR9hdaFY9t3bLcvqgVjTVWVtz9GFUDtWADB_iLx/pub?output=csv'

/**
 * Minimal CSV parser
 * - first row = headers
 * - no embedded commas
 * - values controlled in Google Sheet
 */
function parseCSV(csv: string): Record<string, string>[] {
  const [headerLine, ...lines] = csv.trim().split('\n')
  const headers = headerLine.split(',').map(h => h.trim())

  return lines.map(line => {
    const values = line.split(',').map(v => v.trim())
    const row: Record<string, string> = {}

    headers.forEach((h, i) => {
      row[h] = values[i] ?? ''
    })

    return row
  })
}

export async function loadExperiences(): Promise<RecoExperience[]> {
  const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' })
  const csv = await res.text()
  const rows = parseCSV(csv)

  return rows.map(row => ({
  id: row.id,
  activity_key: row.activity_key,
  engagement: row.engagement as Engagement,

  calma_tipo: row.calma_tipo
    ? (row.calma_tipo as CalmaTipo)
    : undefined,

  participacion_tipo: row.participacion_tipo
    ? (row.participacion_tipo as ParticipacionTipo)
    : undefined,

  sacudida_tipo: row.sacudida_tipo
    ? (row.sacudida_tipo as SacudidaTipo)
    : undefined,

  resolucion: row.resolucion
    ? (row.resolucion as Resolucion)
    : undefined,
})) as RecoExperience[]
}
