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
  const SNAP_THRESHOLD = 4

  const [height, setHeight] = useState(MIN_HEIGHT)
  const lastY = useRef<number | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const TAP_THRESHOLD = 6
  const startY = useRef<number | null>(null)


  useEffect(() => {
    if (open) setHeight(MIN_HEIGHT)
  }, [open])

  if (!open) return null

  /* 🔥 Empêche le drag quand on touche un élément interactif */
  function isInteractive(target: HTMLElement) {
    return !!target.closest("button, a, svg, input, textarea, [role='button']")
  }

  function handleTouchStart(e: React.TouchEvent) {
  const target = e.target as HTMLElement
  if (isInteractive(target)) {
    lastY.current = null
    startY.current = null
    return
  }

  startY.current = e.touches[0].clientY
  lastY.current = startY.current
  isDragging.current = false
}

  function handleTouchMove(e: React.TouchEvent) {
  if (lastY.current === null || startY.current === null) return

  const currentY = e.touches[0].clientY
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
  const atMaxHeight = height >= MAX_HEIGHT

  if (!atMaxHeight && scrollingUp) {
    e.preventDefault()
    bodyEl.scrollTop = 0
    setHeight(h => Math.min(MAX_HEIGHT, h + Math.abs(delta) * DRAG_SPEED))
  }
  else if (scrollingDown && atTop && height > MIN_HEIGHT) {
    e.preventDefault()
    setHeight(h => Math.max(MIN_HEIGHT, h - Math.abs(delta) * DRAG_SPEED))
  }

  lastY.current = currentY
}

  function handleTouchEnd() {
  if (!isDragging.current) {
    // 👉 C'était un TAP → laisser le click se produire
    lastY.current = null
    startY.current = null
    return
  }

  if (height > MAX_HEIGHT - SNAP_THRESHOLD) setHeight(MAX_HEIGHT)
  else if (height < MIN_HEIGHT + SNAP_THRESHOLD) setHeight(MIN_HEIGHT)

  lastY.current = null
  startY.current = null
  isDragging.current = false
}

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />

      <div
        className="bottom-sheet"
        style={{ height: `${height}vh` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
