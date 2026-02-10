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
  const MIN_HEIGHT = 50
  const MAX_HEIGHT = 80
  const DRAG_SPEED = 0.35
  const SNAP_THRESHOLD = 4

  const [height, setHeight] = useState(MIN_HEIGHT)

  const lastY = useRef<number | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  /* RESET HEIGHT À CHAQUE OUVERTURE */
  useEffect(() => {
    if (open) setHeight(MIN_HEIGHT)
  }, [open])

  /* ⚠️ Hooks DOIVENT être au-dessus des returns conditionnels */
  if (!open) return null

  function handleTouchStart(e: React.TouchEvent) {
    lastY.current = e.touches[0].clientY
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (lastY.current === null) return

    const currentY = e.touches[0].clientY
    const delta = lastY.current - currentY
    const bodyEl = bodyRef.current
    if (!bodyEl) return

    const scrollingUp = delta > 0
    const scrollingDown = delta < 0
    const atTop = bodyEl.scrollTop <= 0
    const atMaxHeight = height >= MAX_HEIGHT

    /* 🚀 PHASE 1 — EXPANSION AVANT SCROLL */
    if (!atMaxHeight && scrollingUp) {
      e.preventDefault()
      bodyEl.scrollTop = 0   // 🔥 bloque le scroll contenu
      setHeight(h => Math.min(MAX_HEIGHT, h + Math.abs(delta) * DRAG_SPEED))
    }

    /* 🔽 PHASE 2 — RÉDUCTION SHEET */
    else if (scrollingDown && atTop && height > MIN_HEIGHT) {
      e.preventDefault()
      setHeight(h => Math.max(MIN_HEIGHT, h - Math.abs(delta) * DRAG_SPEED))
    }

    lastY.current = currentY
  }

  function handleTouchEnd() {
    if (height > MAX_HEIGHT - SNAP_THRESHOLD) setHeight(MAX_HEIGHT)
    else if (height < MIN_HEIGHT + SNAP_THRESHOLD) setHeight(MIN_HEIGHT)

    lastY.current = null
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

        <div ref={bodyRef} className="sheet-body">
          {body}
        </div>

        {footer && <div className="sheet-footer">{footer}</div>}
      </div>
    </>
  )
}
