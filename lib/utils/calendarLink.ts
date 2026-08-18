// Lien "Ajouter au calendrier" (Google Calendar) pour une réservation
// confirmée. Pas de fichier .ics généré : un simple lien évite tout souci de
// téléchargement et fonctionne aussi bien sur mobile que desktop.
function pad(n: number): string {
  return String(n).padStart(2, "0")
}

// booking.time est du texte libre ("Mañana", "Tarde (~14:00)"...) reconstruit
// depuis `message` côté API (voir /api/booking/[bookingId]) — pas d'heure
// garantie, donc on retombe sur un créneau par défaut par moment du jour.
function guessStartHour(time: string): { hour: number; minute: number } {
  const explicit = time.match(/(\d{1,2}):(\d{2})/)
  if (explicit) {
    return { hour: Number(explicit[1]), minute: Number(explicit[2]) }
  }
  if (/tarde/i.test(time)) return { hour: 14, minute: 0 }
  if (/noche/i.test(time)) return { hour: 18, minute: 0 }
  return { hour: 9, minute: 0 } // "Mañana" ou horaire inconnu
}

export function buildCalendarLink(date: string, time: string, title: string): string {
  const [year, month, day] = date.split("-").map(Number)
  if (!year || !month || !day) return ""

  const { hour, minute } = guessStartHour(time)
  const start = new Date(year, month - 1, day, hour, minute)
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000) // durée par défaut : 2h

  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: "Reservado a través de Vivabox.",
    ctz: "America/Bogota",
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
