"use client"

import { useEffect, useRef, useState } from "react"
import VivaboxLogo from "@/components/ui/VivaboxLogo"

type Props = {
  onOpen: () => void
  width?: number
  height?: number
}

/**
 * Bouton logo qui ouvre le quiz de recommandations, avec son nudge de
 * découvrabilité (blink des 4 couleurs toutes les 15s tant que non ouvert).
 * L'état/interval du blink vit ici (et pas dans la page) pour que son
 * re-render périodique reste isolé à ce bouton — sans ça, tout l'arbre de la
 * page (carte Leaflet, bottom sheet ouverte...) re-render toutes les 15s en
 * même temps, ce qui se traduisait par un flash visible sur la card ouverte.
 */
export default function LogoQuizButton({ onOpen, width = 50, height = 50 }: Props) {
  const [logoBlinking, setLogoBlinking] = useState(false)
  const hasOpenedRef = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (hasOpenedRef.current) return

      setLogoBlinking(true)
      setTimeout(() => setLogoBlinking(false), 2900)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  return (
    <button
      onClick={() => {
        hasOpenedRef.current = true
        onOpen()
      }}
      aria-label="Abrir recomendaciones Vivabox"
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <VivaboxLogo width={width} height={height} blinking={logoBlinking} />
    </button>
  )
}
