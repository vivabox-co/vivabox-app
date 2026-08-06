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
 * CSV parser tenant compte des champs entre guillemets (ex: titres/descriptions
 * contenant une virgule, comme `"Escuela de buceo en Bogota, Colombia"`).
 * Un simple split(',') décale toutes les colonnes suivantes dès qu'un champ
 * cité contient une virgule — c'est ce qui causait des activity_key mal
 * alignés (donc introuvables) pour certaines lignes du Sheet.
 */
function splitCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        current += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  values.push(current.trim())
  return values
}

function parseCSV(csv: string): Record<string, string>[] {
  const [headerLine, ...lines] = csv.trim().split('\n')
  const headers = splitCsvLine(headerLine)

  return lines
    .filter(line => line.trim())
    .map(line => {
      const values = splitCsvLine(line)
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
