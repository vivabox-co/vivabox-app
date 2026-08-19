"use client"

import { useLayoutEffect, useRef, useState } from "react"

// La carte "suivante" (voir ACTIVATION FLOW dans globals.css) peut être
// plus haute que la carte "actuelle" qui donne sa hauteur au viewport —
// sans ça, .vb-activation-viewport (overflow:hidden) la coupe pendant la
// transition. On mesure sa hauteur réelle dès qu'elle est montée et on
// l'applique en min-height sur le viewport le temps du glissement.
export function useNextCardMinHeight(active: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const [minHeight, setMinHeight] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (active && ref.current) {
      setMinHeight(ref.current.getBoundingClientRect().height)
    } else if (!active) {
      setMinHeight(null)
    }
  }, [active])

  return { ref, minHeight }
}
