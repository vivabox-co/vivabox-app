// Vigencia de la Vivabox : 6 meses de calendario a partir de la fecha de
// compra (activation_codes.created_at — ver comentario en /api/codigo/context).
// No usar activated_at/registration/first_login : la caja es válida desde que
// se compró, no desde que el beneficiario la activó.

const VIGENCIA_MONTHS = 6

// Días restantes en los que ya mostramos el estado de urgencia (ⓘ ver FAQ) —
// no es una regla de negocio estricta, solo el umbral visual "se acerca el
// vencimiento".
const URGENT_THRESHOLD_DAYS = 15

export type VigenciaStatus = "active" | "urgent" | "expired"

export type VigenciaInfo = {
  expiresAt: Date
  daysRemaining: number
  status: VigenciaStatus
}

// setMonth() de JS no hace lo que uno espera cuando el mes destino tiene
// menos días (ej: 31 ene + 1 mes -> "3 marzo", porque "31 feb" no existe y
// rebalancea). Se corrige llevando el día al último día real del mes
// destino cuando haga falta, en vez de dejar que rebase al mes siguiente.
export function addCalendarMonths(date: Date, months: number): Date {
  const day = date.getDate()
  const firstOfTargetMonth = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const lastDayOfTargetMonth = new Date(
    firstOfTargetMonth.getFullYear(),
    firstOfTargetMonth.getMonth() + 1,
    0
  ).getDate()
  firstOfTargetMonth.setDate(Math.min(day, lastDayOfTargetMonth))
  return firstOfTargetMonth
}

export function getVigenciaInfo(purchaseDateIso: string, now: Date = new Date()): VigenciaInfo {
  const purchaseDate = new Date(purchaseDateIso)
  const expiresAt = addCalendarMonths(purchaseDate, VIGENCIA_MONTHS)

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const expiresAtMidnight = new Date(expiresAt.getFullYear(), expiresAt.getMonth(), expiresAt.getDate())
  const daysRemaining = Math.round((expiresAtMidnight.getTime() - today.getTime()) / 86_400_000)

  const status: VigenciaStatus =
    daysRemaining < 0 ? "expired" : daysRemaining <= URGENT_THRESHOLD_DAYS ? "urgent" : "active"

  return { expiresAt, daysRemaining, status }
}

export function formatVigenciaDate(date: Date): string {
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
}
