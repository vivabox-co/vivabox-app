"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useUI } from "@/components/ui/UIContext"
import { Experience } from "@/lib/data/types"
import { Heart } from "lucide-react"

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  experience: Experience | null
  children: React.ReactNode
}

export default function BottomSheet({
  open,
  onClose,
  experience,
  children,
}: BottomSheetProps) {
  const [expanded, setExpanded] = useState(false)

  const startY = useRef<number | null>(null)
  const deltaY = useRef(0)

  const router = useRouter()
  const {
    setSelectedExperience,
    setDrawerOpen,
    favorites,
    toggleFavorite,
  } = useUI()

  if (!open || !experience) return null

  const isFavorite = favorites.includes(experience.id)

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

  function handleChoosePlan() {
    setSelectedExperience(experience)
    setDrawerOpen(false)
    router.push("/reservar/fechas")
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

        {/* HEADER */}
        <div style={{ padding: "16px 16px 0 16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ margin: 0 }}>{experience.title}</h2>

            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(experience.id)
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <Heart
                size={22}
                strokeWidth={2}
                fill={isFavorite ? "#ff4d6d" : "none"}
                color={isFavorite ? "#ff4d6d" : "#999"}
              />
            </button>
          </div>

          <p style={{ opacity: 0.6, marginTop: 4 }}>
            {experience.zone}
          </p>
        </div>

        {/* CONTENT */}
        <div className="sheet-content">{children}</div>

        {/* CTA */}
        <div className="sheet-footer">
          <button className="cta-button" onClick={handleChoosePlan}>
            Elegir este plan
          </button>
        </div>
      </div>
    </>
  )
}
