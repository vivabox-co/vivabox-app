"use client"

import { Check, X, ChevronLeft, ChevronRight } from "lucide-react"
import { categoryColors } from "@/lib/map/categoryColors"
import BrandDots from "@/components/ui/BrandDots"

export type BookingStatus =
  | "requested"
  | "waiting_provider"
  | "searching_alternative"
  | "alternative_proposed"
  | "confirmed"
  | "rejected"
  | "done"

// 4 étapes FIXES représentant le parcours — jamais recréées ni renommées
// selon les événements qui surviennent à l'intérieur de l'une d'elles (voir
// AVAILABILITY_DESCRIPTION plus bas pour ce qui varie réellement).
const STEPS = [
  { key: "requested", label: "Solicitud recibida", description: "Tu elección llegó correctamente." },
  { key: "availability", label: "Disponibilidad con el lugar", description: "Estamos verificando disponibilidad." },
  { key: "confirmed", label: "Fecha confirmada", description: "Te avisaremos apenas esté lista." },
  { key: "done", label: "Todo listo", description: "Ya puedes disfrutar." },
]

// L'étape "Disponibilidad con el lugar" couvre TOUTE la période où Vivabox
// négocie avec le lugar — première date indisponible, recherche d'une
// alternative, proposition, refus de cette proposition, nouvelle recherche...
// Aucun de ces événements ne crée de nouvelle étape ni ne renomme celle-ci :
// seul son contenu change, via cette table (description) et `activeContent`
// (voir Props, pour la carte de proposition + décision côté page).
const AVAILABILITY_DESCRIPTION: Partial<Record<BookingStatus, string>> = {
  searching_alternative: "La fecha que elegiste no estaba disponible. Estamos buscando otra opción para tu experiencia.",
  alternative_proposed: "La fecha que elegiste no estaba disponible. Encontramos otra opción para tu experiencia.",
}

// "rejected" ne réutilise pas les 4 étapes fixes : la cancellation est un
// état TERMINAL de la timeline, pas une 3e/4e étape simplement grisée. On ne
// garde que les 2 étapes réellement acquises (requested, availability) puis
// on referme le parcours sur cette 3e étape "Reserva cancelada" — jamais
// "Fecha confirmada" / "Todo listo" après une annulation (voir activeSteps
// plus bas). Le texte reste générique faute de raison structurée en base
// (pas de colonne cancellation_reason côté Supabase aujourd'hui) — à
// affiner le jour où cette donnée existera, sans changer cette mécanique.
const REJECTED_AVAILABILITY_DESCRIPTION = "Buscamos una fecha disponible para ti."
const CANCELLED_STEP = {
  key: "cancelled",
  label: "Reserva cancelada",
  description: "No encontramos una opción que funcionara para esta experiencia.",
}

// Position de chaque statut sur la ligne de progression — "searching_alternative"
// et "alternative_proposed" restent tous deux sur l'étape "Disponibilidad con
// el lugar" (index 1), jamais une étape à part.
// "rejected" n'a pas d'entrée ici : son currentIndex est dérivé séparément
// (dernière étape de activeSteps, voir plus bas) puisque ses étapes ne sont
// pas les mêmes que STEPS.
const PROGRESS_INDEX: Record<Exclude<BookingStatus, "rejected">, number> = {
  requested: 0,
  waiting_provider: 1,
  searching_alternative: 1,
  alternative_proposed: 1,
  confirmed: 2,
  done: 3,
}

// Ces sous-états de "Disponibilidad con el lugar" affichent un point plein
// (en cours) plutôt qu'un check tant qu'ils ne sont pas résolus — les autres
// statuts gardent le check dès que l'étape est atteinte, comme avant.
const DOT_STATUSES: BookingStatus[] = ["searching_alternative", "alternative_proposed"]

type Props = {
  status: BookingStatus
  category: string
  onNext?: () => void
  onPrev?: () => void
  // Contenu additionnel rendu à l'intérieur de l'étape en cours (sous sa
  // description), pour les statuts qui ont besoin d'ouvrir cette étape au
  // lieu d'un bloc séparé — aujourd'hui seul "alternative_proposed" l'utilise
  // (voir seguimiento/[bookingId]/page.tsx). Générique : accepte n'importe
  // quel ReactNode, donc afficher plusieurs propositions plus tard ne demande
  // aucun changement ici, seulement dans ce que le parent construit.
  activeContent?: React.ReactNode
}

export default function BookingTimeline({ status, category, onNext, onPrev, activeContent }: Props) {
  const color = categoryColors[category] || "#111"
  const isRejected = status === "rejected"
  const availabilityDescription = AVAILABILITY_DESCRIPTION[status]
  const activeSteps = isRejected
    ? [STEPS[0], { ...STEPS[1], description: REJECTED_AVAILABILITY_DESCRIPTION }, CANCELLED_STEP]
    : availabilityDescription
    ? STEPS.map((step, i) => (i === 1 ? { ...step, description: availabilityDescription } : step))
    : STEPS
  const currentIndex = isRejected ? activeSteps.length - 1 : PROGRESS_INDEX[status]
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h3 style={{ fontSize: 18, margin: 0 }}>
            Así va tu experiencia
          </h3>
          <BrandDots style={{ marginBottom: 0 }} />
        </div>

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

      <div>
        {activeSteps.map((step, i) => {
          const reached = i <= currentIndex
          // Seules les timelines "alternative_proposed" et
          // "searching_alternative" distinguent une étape en cours (point
          // plein — on attend une action du bénéficiaire, ou Vivabox
          // travaille encore dessus) d'une étape acquise (check) — les
          // autres statuts gardent le check dès que l'étape est atteinte,
          // comme avant.
          const isCurrent = DOT_STATUSES.includes(status) && i === currentIndex
          const isLast = i === activeSteps.length - 1
          // Étape terminale d'une timeline annulée : cercle rouge d'erreur
          // (déjà utilisé ailleurs dans l'app, ex. actionError) + croix,
          // jamais un check — visuellement distinct d'une étape acquise
          // normale, sans introduire de nouvelle couleur.
          const isCancelledStep = isRejected && isLast
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
                    backgroundColor: reached ? (isCancelledStep ? "#B42318" : color) : "#E8E3DC",
                    border: reached ? "none" : "2px solid #E8E3DC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {isCancelledStep && <X size={13} color="#FFF" />}
                  {reached && !isCurrent && !isCancelledStep && <Check size={13} color="#FFF" />}
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
                  color: isCancelledStep ? "#B42318" : reached ? "#111" : "#999",
                  fontWeight: reached ? 500 : 400,
                  lineHeight: 1.3,
                }}>
                  {step.label}
                </div>
                <div style={{
                  marginTop: 3,
                  fontSize: 13,
                  color: isCancelledStep ? "#B42318" : reached ? "#888" : "#bbb",
                  lineHeight: 1.4,
                }}>
                  {step.description}
                </div>
                {isCurrent && activeContent && (
                  <div style={{ marginTop: 14 }}>{activeContent}</div>
                )}
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

