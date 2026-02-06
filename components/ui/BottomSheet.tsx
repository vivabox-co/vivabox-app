"use client"

import { useState, useRef } from "react"

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function BottomSheet({
  open,
  onClose,
  children,
}: BottomSheetProps) {
  const [expanded, setExpanded] = useState(false)

  const startY = useRef<number | null>(null)
  const deltaY = useRef(0)

  if (!open) return null

  function handleTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (startY.current === null) return
    deltaY.current = e.touches[0].clientY - startY.current
  }

  function handleTouchEnd() {
    if (startY.current === null) return

    if (deltaY.current < -50) setExpanded(true)

    if (deltaY.current > 50) {
      if (expanded) setExpanded(false)
      else onClose()
    }

    startY.current = null
    deltaY.current = 0
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />

      <div
        className={`bottom-sheet ${expanded ? "expanded" : ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="sheet-handle" />
        <div className="sheet-content">{children}</div>
      </div>
    </>
  )
}
