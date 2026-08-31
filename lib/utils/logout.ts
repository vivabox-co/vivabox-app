// Utilisé par /ayuda (post-réservation) et /ayuda-general (pré-réservation) :
// même logique de sortie de session dans les deux cas.
export async function logout() {
  if (!window.confirm("¿Cerrar sesión y volver al inicio?")) return

  try {
    await fetch("/api/logout", { method: "POST" })
  } catch {
    // Le cookie httpOnly ne peut être effacé que côté serveur ; si l'appel
    // échoue on redirige quand même — /activar redemandera le code au
    // prochain accès si le cookie a survécu.
  }

  sessionStorage.removeItem("vb_session")
  sessionStorage.removeItem("vb_codigo")
  localStorage.removeItem("currentBooking")

  // Full reload (pas router.push) pour repartir avec un contexte UI/état vierge.
  window.location.href = "/activar"
}
