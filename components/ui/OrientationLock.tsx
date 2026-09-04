"use client"

import { useEffect } from "react"

// Verrou "dur" côté Android/Chrome quand l'app tourne en standalone (PWA
// installée) — silencieux ailleurs (iOS Safari, onglet navigateur classique)
// où l'API n'existe pas ou rejette : voir l'overlay CSS ci-dessous pour ces cas.
export default function OrientationLock() {
  useEffect(() => {
    const orientation = screen.orientation as
      | (ScreenOrientation & { lock?: (o: OrientationLockType) => Promise<void> })
      | undefined
    orientation?.lock?.("portrait").catch(() => {})
  }, [])

  return (
    <div className="orientation-lock-overlay" role="alert">
      <div className="orientation-lock-message">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="6"
            y="2"
            width="12"
            height="20"
            rx="2"
            stroke="white"
            strokeWidth="1.5"
            transform="rotate(90 12 12)"
          />
        </svg>
        <p>Gira tu teléfono a modo vertical para continuar</p>
      </div>
    </div>
  )
}
