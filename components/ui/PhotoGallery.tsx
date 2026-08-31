"use client"

import { useCallback, useRef, useState } from "react"

type DragState = {
  startX: number
  startScrollLeft: number
  startIndex: number
  dragging: boolean
}

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
  const [active, setActive] = useState(0)

  const showNav = photos.length > 1

  const handleScroll = useCallback(() => {
    const el = trackRef.current
    if (!el || !el.clientWidth || dragRef.current?.dragging) return
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
    dragRef.current = {
      startX: e.clientX,
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
    el.scrollLeft = state.startScrollLeft - (e.clientX - state.startX)
  }

  const handlePointerEnd = (e: React.PointerEvent) => {
    const el = trackRef.current
    const state = dragRef.current
    if (!el || !state?.dragging) return
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
