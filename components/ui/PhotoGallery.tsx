"use client"

import { useCallback, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
}

// Galerie photo partagée (scroll-snap + dots cliquables + flèches + drag
// souris/tactile) — portée depuis ExperienceModal.tsx du site vitrine pour
// remplacer les 3 implémentations dupliquées (experiencia, fechas, DetailScreen).
export default function PhotoGallery({ photos, alt, style, imageStyle, dotsBottom = 12, children }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
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

  const goPrev = () => goTo((active - 1 + photos.length) % photos.length)
  const goNext = () => goTo((active + 1) % photos.length)

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
    const threshold = el.clientWidth * 0.15

    let target = state.startIndex
    if (dx <= -threshold) target = Math.min(state.startIndex + 1, photos.length - 1)
    else if (dx >= threshold) target = Math.max(state.startIndex - 1, 0)

    goTo(target)
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
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
          userSelect: "none",
          cursor: showNav ? "grab" : "default",
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
          <button onClick={goPrev} aria-label="Foto anterior" style={{ ...arrowBase, left: 10 }}>
            <ChevronLeft size={18} strokeWidth={2} />
          </button>

          <button onClick={goNext} aria-label="Foto siguiente" style={{ ...arrowBase, right: 10 }}>
            <ChevronRight size={18} strokeWidth={2} />
          </button>

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

const arrowBase: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "none",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  zIndex: 20,
}
