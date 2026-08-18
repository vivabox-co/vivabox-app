// Format court en espagnol ("hace 2 horas") pour situer la demande dans le
// temps sur /reservar/seguimiento, sans dépendance externe (aucune lib de
// date n'est utilisée ailleurs dans ce repo).
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""

  const diffMs = Date.now() - then
  const minutes = Math.floor(diffMs / 60000)

  if (minutes < 1) return "hace un momento"
  if (minutes < 60) return `hace ${minutes} minuto${minutes === 1 ? "" : "s"}`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} hora${hours === 1 ? "" : "s"}`

  const days = Math.floor(hours / 24)
  return `hace ${days} día${days === 1 ? "" : "s"}`
}
