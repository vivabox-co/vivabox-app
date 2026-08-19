"use client"

import { Check, X, ChevronLeft, ChevronRight } from "lucide-react"
import { categoryColors } from "@/lib/map/categoryColors"

export type BookingStatus =
  | "requested"
  | "waiting_provider"
  | "alternative_proposed"
  | "confirmed"
  | "rejected"
  | "done"

const steps = [
  { key: "requested", label: "Solicitud recibida", description: "Tu elección llegó correctamente." },
  { key: "waiting_provider", label: "Confirmando con el lugar", description: "Estamos verificando disponibilidad." },
  { key: "confirmed", label: "Fecha confirmada", description: "Te avisaremos cuando esté lista." },
  { key: "done", label: "Todo listo", description: "Ya puedes disfrutar." },
]

// "alternative_proposed" a besoin de son propre jeu d'étapes : le lugar a
// déjà répondu (donc "Confirmando con el lugar" serait faux), et l'étape en
// cours attend une action du bénéficiaire plutôt qu'une simple confirmation —
// d'où le cercle "current" distinct du check "done" (voir `isCurrent` plus bas).
const ALTERNATIVE_STEPS = [
  { key: "requested", label: "Solicitud recibida", description: "Tu elección llegó correctamente." },
  { key: "responded", label: "El lugar respondió", description: "Encontraron una nueva fecha para ti." },
  { key: "awaiting_response", label: "Esperando tu respuesta", description: "Dinos si esta fecha te funciona." },
  { key: "confirmed", label: "Fecha confirmada", description: "Te avisaremos cuando esté lista." },
  { key: "done", label: "Todo listo", description: "Ya puedes disfrutar." },
]
const ALTERNATIVE_CURRENT_INDEX = 2

// Position de chaque statut sur la ligne de progression (jeu d'étapes par
// défaut ci-dessus — "alternative_proposed" utilise ALTERNATIVE_STEPS et
// ALTERNATIVE_CURRENT_INDEX à la place, voir plus bas).
// "rejected" retombe à -1 : rien n'est acquis (cf. encadré rouge au-dessus).
const PROGRESS_INDEX: Record<Exclude<BookingStatus, "alternative_proposed">, number> = {
  requested: 0,
  waiting_provider: 1,
  confirmed: 2,
  rejected: -1,
  done: 3,
}

type Props = {
  status: BookingStatus
  category: string
  onNext?: () => void
  onPrev?: () => void
}

export default function BookingTimeline({ status, category, onNext, onPrev }: Props) {
  const color = categoryColors[category] || "#111"
  const isAlternative = status === "alternative_proposed"
  const activeSteps = isAlternative ? ALTERNATIVE_STEPS : steps
  const currentIndex = isAlternative ? ALTERNATIVE_CURRENT_INDEX : PROGRESS_INDEX[status]
  const CIRCLE_SIZE = 22

  return (
    <div style={{ marginTop: 30 }}>
      
      {/* HEADER + ARROWS */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 22,
      }}>
        <h3 style={{ fontSize: 18, margin: 0 }}>
          Así va tu experiencia
        </h3>

        {(onNext || onPrev) && (
          <div style={{ display: "flex", gap: 8 }}>
            {onPrev && (
              <button onClick={onPrev} style={arrowBtn}>
                <ChevronLeft size={16} />
              </button>
            )}
            {onNext && (
              <button onClick={onNext} style={arrowBtn}>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {status === "rejected" && (
        <div style={errorBox}>
          <X size={14} />
          No pudimos confirmar la fecha solicitada. Te ayudaremos a encontrar una alternativa.
        </div>
      )}

      <div>
        {activeSteps.map((step, i) => {
          const reached = i <= currentIndex
          // Seule la timeline "alternative_proposed" distingue une étape en
          // cours (point plein, on attend une action du bénéficiaire) d'une
          // étape acquise (check) — les autres statuts gardent le check dès
          // que l'étape est atteinte, comme avant.
          const isCurrent = isAlternative && i === currentIndex
          const isLast = i === activeSteps.length - 1
          // Le connecteur sous ce cercle est rempli seulement si l'étape
          // suivante est elle aussi atteinte — pas de pourcentage intermédiaire,
          // ça reste net avec `flex: 1` quelle que soit la hauteur réelle de la
          // ligne (texte sur une ou deux lignes selon l'écran).
          const nextReached = i + 1 <= currentIndex

          return (
            <div
              key={step.key}
              style={{
                display: "flex",
                alignItems: "stretch",
                gap: 14,
              }}
            >
              {/* RAIL : cercle + connecteur, empilés pour occuper toute la
                  hauteur réelle de la ligne (voir `alignItems: stretch`
                  ci-dessus) au lieu d'un calcul en pixels fixes qui décalait
                  la ligne dès que le texte passait sur deux lignes. */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: CIRCLE_SIZE, flexShrink: 0 }}>
                <div
                  style={{
                    width: CIRCLE_SIZE,
                    height: CIRCLE_SIZE,
                    borderRadius: "50%",
                    backgroundColor: reached ? color : "#E8E3DC",
                    border: reached ? "none" : "2px solid #E8E3DC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {reached && !isCurrent && <Check size={13} color="#FFF" />}
                  {isCurrent && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFF" }} />
                  )}
                </div>

                {!isLast && (
                  <div
                    style={{
                      width: 2,
                      flex: 1,
                      minHeight: 24,
                      margin: "2px 0",
                      background: nextReached ? color : "#E8E3DC",
                      transition: "background 0.4s ease",
                    }}
                  />
                )}
              </div>

              {/* LABEL + DESCRIPTION */}
              <div style={{ paddingBottom: isLast ? 0 : 28 }}>
                <div style={{
                  color: reached ? "#111" : "#999",
                  fontWeight: reached ? 500 : 400,
                  lineHeight: 1.3,
                }}>
                  {step.label}
                </div>
                <div style={{
                  marginTop: 3,
                  fontSize: 13,
                  color: reached ? "#888" : "#bbb",
                  lineHeight: 1.4,
                }}>
                  {step.description}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* STYLES */

const arrowBtn: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: "1px solid #E5E2DB",
  background: "#FFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
}

const errorBox: React.CSSProperties = {
  padding: "10px 14px",
  background: "#FDECEA",
  color: "#B42318",
  borderRadius: 12,
  marginBottom: 18,
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  gap: 6,
}
