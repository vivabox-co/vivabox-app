"use client"

import { useState } from "react"

export type FaqAccordionItem = {
  question: string
  answer: string
}

type Props = {
  items: FaqAccordionItem[]
}

// Style éditorial repris du site vitrine (FaqAccordion.tsx) : fines
// dividers au lieu de cards, pas d'icônes, toggle typographique +/- au
// lieu d'un chevron. Adapté à la palette de l'app (pas de --nm-border
// / .vb-dark ici, l'app est toujours en contexte clair).
export default function FaqAccordion({ items }: Props) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = open === i
        const isLast = i === items.length - 1

        return (
          <div
            key={item.question}
            style={{
              borderBottom: isLast ? "none" : "1px solid #E7E2DC",
            }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                gap: 16,
                padding: "18px 0",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, lineHeight: 1.4, color: "#222" }}>
                {item.question}
              </span>

              <span
                aria-hidden="true"
                style={{
                  position: "relative",
                  height: 16,
                  width: 16,
                  flexShrink: 0,
                  color: isOpen ? "#152F40" : "#999",
                  transition: "color 0.2s ease",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    height: 1.5,
                    width: 16,
                    transform: "translate(-50%, -50%)",
                    background: "currentColor",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    height: 16,
                    width: 1.5,
                    transform: `translate(-50%, -50%) rotate(${isOpen ? 90 : 0}deg)`,
                    background: "currentColor",
                    transition: "transform 0.2s ease",
                  }}
                />
              </span>
            </button>

            <div
              style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: "grid-template-rows 0.2s ease-out",
              }}
            >
              <div style={{ minHeight: 0, overflow: "hidden" }}>
                <p
                  onClick={() => setOpen(null)}
                  style={{
                    margin: 0,
                    padding: "0 0 18px",
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "#666",
                    cursor: "pointer",
                  }}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
