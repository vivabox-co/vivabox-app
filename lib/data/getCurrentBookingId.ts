// "currentBooking" n'est écrit dans localStorage qu'au moment de la
// confirmation d'une nouvelle réservation (voir reservar/fechas/confirmacion)
// et effacé par le logout (BottomNav.handleLogout). Un bénéficiaire qui se
// déconnecte puis se reconnecte (code déjà activé → /api/verify_access)
// retrouve une session et une réservation valides côté serveur, mais plus
// aucune trace locale de son id — /experiencia et /ayuda, qui ne
// connaissaient que cette source, redirigeaient alors dans le vide. On
// retombe ici sur /api/codigo/context (le cookie de session suffit, pas
// besoin du token brut) et on réécrit le localStorage au passage pour que
// les lectures suivantes retrouvent la voie rapide.
export async function getCurrentBookingId(): Promise<string | null> {
  const stored = localStorage.getItem("currentBooking")
  const storedId = stored ? JSON.parse(stored).id : null
  if (storedId) return storedId

  try {
    const res = await fetch("/api/codigo/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    const data = await res.json()
    const bookingId = data.success ? data.data?.booking_id ?? null : null
    if (bookingId) {
      localStorage.setItem("currentBooking", JSON.stringify({ id: bookingId }))
    }
    return bookingId
  } catch {
    return null
  }
}
