/**
 * Convierte una duración cruda del sheet a texto legible.
 * Acepta el formato "H:MM" del sheet (ej. "0:45", "2:00", "24:00" → "1 noche"),
 * un valor ya en minutos ("60"), o texto ya formateado (se deja tal cual).
 */
export function formatDuration(duration?: string): string | undefined {
  const value = duration?.trim()
  if (!value) return undefined

  const hm = value.match(/^(\d+):(\d{2})$/)
  if (hm) {
    return formatMinutes(Number(hm[1]) * 60 + Number(hm[2]))
  }

  if (/^\d+$/.test(value)) {
    return formatMinutes(Number(value))
  }

  return value
}

function formatMinutes(totalMinutes: number): string {
  if (totalMinutes >= 1440 && totalMinutes % 1440 === 0) {
    const nights = totalMinutes / 1440
    return `${nights} noche${nights > 1 ? "s" : ""}`
  }

  if (totalMinutes < 60) {
    return `${totalMinutes} min`
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (minutes === 0) {
    return `${hours} hora${hours > 1 ? "s" : ""}`
  }

  return `${hours}h ${minutes}`
}
