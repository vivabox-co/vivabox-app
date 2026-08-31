"use client"

import { useState, useRef, useEffect } from "react"

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  body: React.ReactNode
  footer?: React.ReactNode
}

export default function BottomSheet({
  open,
  onClose,
  body,
  footer,
}: BottomSheetProps) {
  const MIN_HEIGHT = 55
  const MAX_HEIGHT = 80
  const DRAG_SPEED = 0.35
  // Au relâchement, on atterrit toujours sur MIN_HEIGHT ou MAX_HEIGHT (snap binaire),
  // jamais sur une hauteur intermédiaire arbitraire.
  const SNAP_MIDPOINT = (MIN_HEIGHT + MAX_HEIGHT) / 2
  // Pull-to-close : distance (px) à tirer sous MIN_HEIGHT pour fermer le drawer.
  const CLOSE_THRESHOLD = 90
  const CLOSE_MAX_OFFSET = 160
  const CLOSE_RESISTANCE = 0.6

  const [height, setHeight] = useState(MIN_HEIGHT)
  const [dragOffset, setDragOffset] = useState(0)
  // Miroirs synchrones du state : un mousemove attaché sur `window` (voir
  // plus bas) garde la closure de son render de départ et ne verrait jamais
  // les setState suivants. Les refs, elles, sont toujours à jour au moment
  // où on les lit, quel que soit le chemin d'événement (touch ou souris).
  const heightRef = useRef(MIN_HEIGHT)
  const dragOffsetRef = useRef(0)

  const lastY = useRef<number | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  // Après un vrai drag, un click "fantôme" peut suivre le relâchement et
  // atterrir sur l'overlay (qui n'est plus sous le curseur une fois la
  // sheet redimensionnée) → fermerait le drawer juste après l'avoir
  // redimensionné. Ce flag absorbe ce click.
  const suppressNextOverlayClick = useRef(false)

  const TAP_THRESHOLD = 6
  const startY = useRef<number | null>(null)

  // Swipe vers le bas sur l'overlay (au-dessus du sheet) : ferme aussi le drawer.
  const OVERLAY_SWIPE_THRESHOLD = 40
  const overlayStartY = useRef<number | null>(null)
  const overlayClosed = useRef(false)

  useEffect(() => {
    if (open) {
      setHeight(MIN_HEIGHT)
      heightRef.current = MIN_HEIGHT
      setDragOffset(0)
      dragOffsetRef.current = 0
    }
  }, [open])

  if (!open) return null

  /* 🔥 Empêche le drag quand on touche un élément interactif */
  function isInteractive(target: HTMLElement) {
    return !!target.closest("button, a, svg, input, textarea, [role='button']")
  }

  // Comme updateDragOffset : on calcule à partir de la ref (toujours à jour,
  // synchrone) et pas du paramètre du functional setState (qui peut être
  // traité par React de façon différée si plusieurs setHeight s'enchaînent
  // dans le même batch — la ref, elle, ne dépend jamais de ce timing).
  function updateHeight(updater: (h: number) => number) {
    const next = updater(heightRef.current)
    heightRef.current = next
    setHeight(next)
  }

  function updateDragOffset(next: number) {
    dragOffsetRef.current = next
    setDragOffset(next)
  }

  function resetDragState() {
    lastY.current = null
    startY.current = null
    isDragging.current = false
  }

  function beginDrag(target: HTMLElement, clientY: number) {
    if (isInteractive(target)) {
      resetDragState()
      return false
    }
    startY.current = clientY
    lastY.current = clientY
    isDragging.current = false
    return true
  }

  /** Cœur partagé touch + souris. `preventDefault` doit être un no-op côté souris. */
  function processMove(currentY: number, preventDefault: () => void) {
    if (lastY.current === null || startY.current === null) return

    const deltaTotal = Math.abs(currentY - startY.current)

    // 🔥 SI PAS ASSEZ DE MOUVEMENT = TAP → NE PAS PREVENTDEFAULT
    if (deltaTotal < TAP_THRESHOLD) return

    isDragging.current = true

    const delta = lastY.current - currentY
    const bodyEl = bodyRef.current
    if (!bodyEl) return

    const scrollingUp = delta > 0
    const scrollingDown = delta < 0
    const atTop = bodyEl.scrollTop <= 0
    const atMaxHeight = heightRef.current >= MAX_HEIGHT
    const atMinHeight = heightRef.current <= MIN_HEIGHT

    if (scrollingUp) {
      if (dragOffsetRef.current > 0) {
        preventDefault()
        updateDragOffset(Math.max(0, dragOffsetRef.current - Math.abs(delta)))
      } else if (!atMaxHeight) {
        preventDefault()
        bodyEl.scrollTop = 0
        updateHeight(h => Math.min(MAX_HEIGHT, h + Math.abs(delta) * DRAG_SPEED))
      }
    } else if (scrollingDown && atTop) {
      if (!atMinHeight) {
        preventDefault()
        updateHeight(h => Math.max(MIN_HEIGHT, h - Math.abs(delta) * DRAG_SPEED))
      } else {
        // À hauteur mini et on continue de tirer vers le bas → pull-to-close
        preventDefault()
        updateDragOffset(
          Math.min(CLOSE_MAX_OFFSET, dragOffsetRef.current + Math.abs(delta) * CLOSE_RESISTANCE)
        )
      }
    }

    lastY.current = currentY
  }

  function endDrag() {
    if (!isDragging.current) {
      // 👉 C'était un TAP → laisser le click se produire
      resetDragState()
      return
    }

    suppressNextOverlayClick.current = true
    setTimeout(() => {
      suppressNextOverlayClick.current = false
    }, 300)

    if (dragOffsetRef.current > CLOSE_THRESHOLD) {
      resetDragState()
      onClose()
      return
    }

    isDragging.current = false
    updateDragOffset(0)
    updateHeight(h => (h >= SNAP_MIDPOINT ? MAX_HEIGHT : MIN_HEIGHT))

    lastY.current = null
    startY.current = null
  }

  function handleOverlayClick() {
    if (suppressNextOverlayClick.current) {
      suppressNextOverlayClick.current = false
      return
    }
    onClose()
  }

  /* ================= SWIPE SUR L'OVERLAY =================
     Glisser vers le bas au-dessus du sheet (sur l'overlay) le ferme aussi,
     pas seulement un glissement démarré à l'intérieur du sheet. */
  function handleOverlayTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    overlayStartY.current = e.touches[0].clientY
    overlayClosed.current = false
  }

  function handleOverlayTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (overlayStartY.current === null || overlayClosed.current) return
    const delta = e.touches[0].clientY - overlayStartY.current
    if (delta > OVERLAY_SWIPE_THRESHOLD) {
      overlayClosed.current = true
      suppressNextOverlayClick.current = true
      setTimeout(() => {
        suppressNextOverlayClick.current = false
      }, 300)
      onClose()
    }
  }

  function handleOverlayTouchEnd() {
    overlayStartY.current = null
  }

  function handleOverlayMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    overlayStartY.current = e.clientY
    overlayClosed.current = false
    window.addEventListener("mousemove", handleOverlayWindowMouseMove)
    window.addEventListener("mouseup", handleOverlayWindowMouseUp)
  }

  function handleOverlayWindowMouseMove(e: MouseEvent) {
    if (overlayStartY.current === null || overlayClosed.current) return
    const delta = e.clientY - overlayStartY.current
    if (delta > OVERLAY_SWIPE_THRESHOLD) {
      overlayClosed.current = true
      suppressNextOverlayClick.current = true
      setTimeout(() => {
        suppressNextOverlayClick.current = false
      }, 300)
      onClose()
    }
  }

  function handleOverlayWindowMouseUp() {
    window.removeEventListener("mousemove", handleOverlayWindowMouseMove)
    window.removeEventListener("mouseup", handleOverlayWindowMouseUp)
    overlayStartY.current = null
  }

  /* ================= TOUCH (mobile) =================
     Handlers dédiés (pas Pointer Events) : sur mobile, preventDefault()
     dans un pointermove n'empêche pas fiablement le scroll natif — il
     faut la propriété CSS touch-action pour ça. touchmove, lui, bloque
     bien le scroll natif via preventDefault(), comme avant. */
  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    beginDrag(e.target as HTMLElement, e.touches[0].clientY)
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    processMove(e.touches[0].clientY, () => e.preventDefault())
  }

  function handleTouchEnd() {
    endDrag()
  }

  /* ================= SOURIS (desktop) =================
     mousemove/mouseup sont attachés sur `window` pendant le drag : une
     souris, contrairement au doigt, peut sortir des limites de l'élément
     sans que l'événement s'arrête pour autant. */
  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    if (!beginDrag(e.target as HTMLElement, e.clientY)) return
    window.addEventListener("mousemove", handleWindowMouseMove)
    window.addEventListener("mouseup", handleWindowMouseUp)
  }

  function handleWindowMouseMove(e: MouseEvent) {
    processMove(e.clientY, () => e.preventDefault())
  }

  function handleWindowMouseUp() {
    window.removeEventListener("mousemove", handleWindowMouseMove)
    window.removeEventListener("mouseup", handleWindowMouseUp)
    endDrag()
  }

  return (
    <>
      <div
        className="sheet-overlay"
        onClick={handleOverlayClick}
        onTouchStart={handleOverlayTouchStart}
        onTouchMove={handleOverlayTouchMove}
        onTouchEnd={handleOverlayTouchEnd}
        onTouchCancel={handleOverlayTouchEnd}
        onMouseDown={handleOverlayMouseDown}
      />

      <div
        className="bottom-sheet"
        style={{
          height: `${height}vh`,
          // .bottom-sheet centre horizontalement via translateX(-50%) en CSS ;
          // un style inline remplace (ne fusionne pas) le transform du
          // stylesheet, donc il faut reprendre le translateX ici aussi, sinon
          // le pull-to-close écrase le centrage et la sheet saute à droite.
          transform: `translateX(-50%) translateY(${dragOffset}px)`,
          transition: isDragging.current
            ? "none"
            : "height 0.18s ease-out, transform 0.18s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <div className="sheet-handle" />

        <div
          ref={bodyRef}
          className="sheet-body"
          style={{
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {body}
        </div>

        {footer && (
          <div
            className="sheet-footer"
            style={{
              position: "sticky",
              bottom: 0,
              background: "white",
              padding: "12px",
              boxShadow: "0 -4px 12px rgba(0,0,0,0.08)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
