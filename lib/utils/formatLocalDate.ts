// new Date("YYYY-MM-DD") est parsé comme minuit UTC — dans un fuseau derrière
// UTC (Bogotá = UTC-5), .toLocaleDateString() affichait donc la veille.
// On construit la Date à partir des composants locaux pour éviter le décalage.
export function formatLocalDate(iso: string, options: Intl.DateTimeFormatOptions): string {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString("es-CO", options)
}
