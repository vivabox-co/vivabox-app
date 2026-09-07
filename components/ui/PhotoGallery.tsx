"use client"

import { useCallback, useRef, useState } from "react"

type DragState = {
  startX: number
  startY: number
  startScrollLeft: number
  startIndex: number
  dragging: boolean
}

// Distance (px) à parcourir avant de trancher si le geste est un swipe
// horizontal (changement de photo) ou un drag vertical (destiné au
// bottomsheet qui contient la galerie) — tant que ce n'est pas tranché, on
// ne touche à rien pour ne pas "voler" un geste vertical.
const AXIS_LOCK_THRESHOLD = 8

type Props = {
  photos: string[]
  alt: string
  style?: React.CSSProperties
  imageStyle?: React.CSSProperties
  dotsBottom?: number
  children?: React.ReactNode
  onImageClick?: () => void
}

// Galerie photo partagée (scroll-snap + dots cliquables + drag
// souris/tactile) — portée depuis ExperienceModal.tsx du site vitrine pour
// remplacer les 3 implémentations dupliquées (experiencia, fechas, DetailScreen).
export default function PhotoGallery({ photos, alt, style, imageStyle, dotsBottom = 12, children, onImageClick }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const lastDxRef = useRef(0)
  // Axe du geste en cours, tranché au premier mouvement significatif : tant
  // qu'il n'y a pas assez de mouvement, `null` (indécis). Une fois tranché
  // "vertical", on abandonne le drag (la galerie ne bouge plus du tout) et
  // on laisse le bottomsheet parent gérer le geste.
  const axisLockRef = useRef<"horizontal" | "vertical" | null>(null)
  // Absorbe le click fantôme qui suit le relâchement d'un drag tranché
  // vertical (sinon il ouvrirait la photo en grand alors que l'utilisateur
  // voulait juste redimensionner/fermer le bottomsheet).
  const verticalAbortRef = useRef(false)
  const [active, setActive] = useState(0)

  const showNav = photos.length > 1

  const handleScroll = useCallback(() => {
    const el = trackRef.current
    if (!el || !el.clientWidth) return
    setActive(Math.round(el.scrollLeft / el.clientWidth))
  }, [])

  const goTo = (i: number) => {
    const el = trackRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" })
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current
    if (!el || !el.clientWidth || !showNav) return
    axisLockRef.current = null
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startScrollLeft: el.scrollLeft,
      startIndex: Math.round(el.scrollLeft / el.clientWidth),
      dragging: true,
    }
    el.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const el = trackRef.current
    const state = dragRef.current
    if (!el || !state?.dragging) return

    const dx = e.clientX - state.startX
    const dy = e.clientY - state.startY

    if (axisLockRef.current === null) {
      if (Math.abs(dx) < AXIS_LOCK_THRESHOLD && Math.abs(dy) < AXIS_LOCK_THRESHOLD) {
        // Pas encore assez de mouvement pour trancher l'axe → on ne touche
        // à rien (ni scrollLeft, ni relâchement de la capture).
        return
      }
      axisLockRef.current = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical"
      if (axisLockRef.current === "vertical") {
        // Geste vertical : ce n'est pas un swipe de galerie, c'est un drag
        // destiné au bottomsheet parent. On abandonne complètement — la
        // galerie reste figée pour le reste du geste.
        verticalAbortRef.current = true
        el.releasePointerCapture(e.pointerId)
        dragRef.current = null
        return
      }
    }

    if (axisLockRef.current !== "horizontal") return
    el.scrollLeft = state.startScrollLeft - dx
  }

  const handlePointerEnd = (e: React.PointerEvent) => {
    const el = trackRef.current
    const state = dragRef.current
    if (!el || !state?.dragging || axisLockRef.current !== "horizontal") {
      dragRef.current = null
      return
    }
    dragRef.current = null

    const dx = e.clientX - state.startX
    lastDxRef.current = dx
    const threshold = el.clientWidth * 0.15

    let target = state.startIndex
    if (dx <= -threshold) target = Math.min(state.startIndex + 1, photos.length - 1)
    else if (dx >= threshold) target = Math.max(state.startIndex - 1, 0)

    goTo(target)
  }

  const handleTrackClick = () => {
    // Absorbe le click fantôme qui suit un drag tranché vertical (destiné
    // au bottomsheet, pas à la galerie).
    if (verticalAbortRef.current) {
      verticalAbortRef.current = false
      return
    }
    // Ignore le clic déclenché à la fin d'un swipe (drag > quelques px) —
    // ne déclenche l'action d'image que sur un vrai tap/clic.
    if (showNav && Math.abs(lastDxRef.current) > 5) {
      lastDxRef.current = 0
      return
    }
    lastDxRef.current = 0
    onImageClick?.()
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", ...style }}>
      <div
        ref={trackRef}
        className="hero-gallery-track"
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onDragStart={(e) => e.preventDefault()}
        onClick={onImageClick ? handleTrackClick : undefined}
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
          userSelect: "none",
          cursor: showNav ? "grab" : onImageClick ? "pointer" : "default",
        }}
      >
        {photos.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${alt} ${i + 1}`}
            draggable={false}
            style={{
              flex: "0 0 100%",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              scrollSnapAlign: "center",
              pointerEvents: "none",
              ...imageStyle,
            }}
          />
        ))}
      </div>

      {showNav && (
        <>
          <div
            style={{
              position: "absolute",
              bottom: dotsBottom,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 6,
              zIndex: 20,
            }}
          >
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ver foto ${i + 1}`}
                style={{
                  height: 6,
                  width: i === active ? 18 : 6,
                  borderRadius: 999,
                  border: "none",
                  padding: 0,
                  background: i === active ? "#fff" : "rgba(255,255,255,0.5)",
                  transition: "width 0.2s ease, background 0.15s ease",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </>
      )}

      {children}
    </div>
  )
}
