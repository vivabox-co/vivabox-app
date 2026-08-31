// Chrome n'émet l'événement beforeinstallprompt qu'une seule fois par
// chargement de page et ne le redéclenche jamais — il faut donc le capter
// dès qu'il arrive (potentiellement bien avant que la personne atteigne
// /mapa) et le garder en mémoire jusqu'à ce qu'InstallAppCard veuille
// l'utiliser. Singleton de module plutôt qu'un state React : doit survivre
// aux montages/démontages de pages qui n'ont rien à voir avec lui. Importé
// depuis ClientLayout.tsx pour que l'écoute démarre dès le premier chargement
// de l'app, quelle que soit la route d'entrée.

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
    notify()
  })

  // Une fois l'app réellement installée, l'event capturé n'a plus lieu
  // d'être rejoué (et rappellerait prompt() sur une invite déjà consommée).
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null
    notify()
  })
}

export function getDeferredInstallPrompt() {
  return deferredPrompt
}

export function subscribeInstallPrompt(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function clearDeferredInstallPrompt() {
  deferredPrompt = null
}
