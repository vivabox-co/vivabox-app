"use client"

import { useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"

export type FaqAccordionItem = {
  question: string
  // ReactNode plutôt que string : certaines réponses (ex. app/ayuda-general)
  // ont besoin d'un lien/bouton cliquable dans le texte de la réponse.
  answer: ReactNode
}

type Props = {
  items: FaqAccordionItem[]
  // Si fourni et < items.length, seules les `initialVisibleCount` premières
  // questions sont visibles au chargement ; le reste se révèle derrière un
  // toggle "Ver todas las preguntas" (voir app/ayuda-general). Omis = tout
  // est affiché comme avant (comportement de app/ayuda inchangé).
  initialVisibleCount?: number
}

// Même 4 couleurs que BrandDots (une par couleur du logo), utilisées ici en
// rotation comme repère discret par question — accent uniquement, jamais de
// fond ni de texte coloré.
const ACCENT_COLORS = ["#FF8406", "#CB2033", "#8DB92F", "#0294D2"]

// Style éditorial repris du site vitrine (FaqAccordion.tsx) : fines
// dividers au lieu de cards, pas d'icônes, toggle typographique +/- au
// lieu d'un chevron. Adapté à la palette de l'app (pas de --nm-border
// / .vb-dark ici, l'app est toujours en contexte clair).
export default function FaqAccordion({ items, initialVisibleCount }: Props) {
  const [open, setOpen] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)

  const hasSplit = typeof initialVisibleCount === "number" && initialVisibleCount < items.length
  const primaryItems = hasSplit ? items.slice(0, initialVisibleCount) : items
  const secondaryItems = hasSplit ? items.slice(initialVisibleCount) : []

  function renderItem(item: FaqAccordionItem, i: number, isLast: boolean) {
    const isOpen = open === i
    const accent = ACCENT_COLORS[i % ACCENT_COLORS.length]

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
          <span style={{ display: "flex", flex: 1, alignItems: "flex-start", gap: 10 }}>
            <span
              aria-hidden="true"
              style={{
                width: 7,
                height: 7,
                marginTop: 6,
                borderRadius: "50%",
                background: accent,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.4, color: "#222" }}>
              {item.question}
            </span>
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
  }

  if (!hasSplit) {
    return <div>{items.map((item, i) => renderItem(item, i, i === items.length - 1))}</div>
  }

  return (
    <div>
      {primaryItems.map((item, i) => renderItem(item, i, false))}

      <button
        onClick={() => setShowAll((v) => !v)}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "16px 0",
          background: "none",
          border: "none",
          borderBottom: "1px solid #E7E2DC",
          textAlign: "left",
          cursor: "pointer",
          color: "#0294D2",
          fontSize: 13.5,
          fontWeight: 600,
        }}
      >
        {showAll ? "Ocultar preguntas" : `Ver todas las preguntas · ${items.length}`}
        <ChevronDown
          size={16}
          strokeWidth={2}
          style={{
            flexShrink: 0,
            transform: showAll ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateRows: showAll ? "1fr" : "0fr",
          transition: "grid-template-rows 0.25s ease",
        }}
      >
        <div style={{ minHeight: 0, overflow: "hidden" }}>
          {secondaryItems.map((item, i) =>
            renderItem(item, primaryItems.length + i, i === secondaryItems.length - 1)
          )}
        </div>
      </div>
    </div>
  )
}
