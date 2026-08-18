// Clés utilisées côté client (fechas, reschedule) et dans les réponses API
// liées aux dates — partagé pour éviter que les libellés ES divergent entre
// la demande initiale, le reschedule bénéficiaire et l'alternative proposée
// par l'équipe.
export const MOMENT_LABEL: Record<string, string> = {
  morning: "Mañana",
  afternoon: "Tarde",
  night: "Noche",
}
