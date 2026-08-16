/**
 * Parser CSV en un seul passage sur tout le texte (pas un split("\n") suivi
 * d'un parsing par ligne) : c'est nécessaire car certains champs cités du
 * sheet contiennent des retours à la ligne littéraux (ex: notes tarifaires
 * multi-lignes) — un split("\n") préalable coupe la ligne CSV en plein
 * milieu d'un champ cité et désaligne toutes les colonnes qui suivent
 * (dont `estado`, qui finit vide alors qu'il est bien rempli dans le sheet).
 * Gère aussi les guillemets échappés (`""`) et les fins de ligne \r\n.
 */
function parseRows(csv: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false

  const pushField = () => {
    row.push(field.trim())
    field = ""
  }
  const pushRow = () => {
    pushField()
    rows.push(row)
    row = []
  }

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i]

    if (inQuotes) {
      if (char === '"' && csv[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ",") {
      pushField()
    } else if (char === "\r") {
      // ignoré, "\n" gère la coupure de ligne
    } else if (char === "\n") {
      pushRow()
    } else {
      field += char
    }
  }

  if (field !== "" || row.length > 0) {
    pushRow()
  }

  return rows
}

export function parseCSV(csv: string): Record<string, string>[] {
  const rows = parseRows(csv.trim())
  if (rows.length === 0) return []

  const [headers, ...dataRows] = rows

  return dataRows
    .filter((values) => values.some((v) => v !== ""))
    .map((values) => {
      const row: Record<string, string> = {}
      headers.forEach((h, i) => {
        row[h] = values[i] ?? ""
      })
      return row
    })
}
