"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

const BYPASS_COOKIE = "vb_desktop_ok"
const BLOCK_ROUTE = "/solo-movil"

function hasBypassCookie() {
  return document.cookie.split("; ").some((c) => c === `${BYPASS_COOKIE}=1`)
}

// Filet de sécurité pour le gate desktop du middleware (voir desktopGate
// dans middleware.ts) : ce dernier se base sur le user-agent, qui peut ne
// pas reconnaître certains navigateurs desktop. Ici on vérifie en plus le
// pointeur/la largeur réels — un vrai téléphone n'a jamais un pointeur
// "fin" (souris) sur un écran large. `enabled` vient du serveur
// (process.env.NODE_ENV, voir layout.tsx) pour rester désactivé en local.
export default function DesktopGate({ enabled }: { enabled: boolean }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!enabled || pathname === BLOCK_ROUTE || hasBypassCookie()) return

    const isDesktopLike =
      window.matchMedia("(pointer: fine)").matches && window.innerWidth > 900
    if (isDesktopLike) {
      router.replace(BLOCK_ROUTE)
    }
  }, [enabled, pathname, router])

  return null
}
