// Les heures de créneau stockées (proposed_hour, "(~HH:MM)" dans message)
// sont saisies par l'équipe à titre indicatif — jamais un horaire exact.
// On arrondit donc à l'heure pleine la plus proche avant affichage, pour ne
// pas laisser croire à une précision qui n'existe pas (ex: "07:39" -> "8:00 a. m.").
export function formatApproxHour(hour: string): string | null {
  const match = hour.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return null
  let h = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  if (m >= 30) h = (h + 1) % 24
  const period = h < 12 ? "a. m." : "p. m."
  const displayHour = h % 12 === 0 ? 12 : h % 12
  return `${displayHour}:00 ${period}`
}
