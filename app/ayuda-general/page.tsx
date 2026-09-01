"use client"

import { useEffect, useState } from "react"
import { MessageCircle, Phone, Download } from "lucide-react"
import { getWhatsAppLink, WHATSAPP_NUMBER } from "@/lib/constants/contact"
import { logout } from "@/lib/utils/logout"
import FaqAccordion, { FaqAccordionItem } from "@/components/ui/FaqAccordion"
import BrandDots from "@/components/ui/BrandDots"
import { InstallAppModal, isStandalone } from "@/components/ui/InstallAppCard"
import { getVigenciaInfo, formatVigenciaDate, VigenciaInfo } from "@/lib/utils/vigencia"

// Nombre de questions toujours visibles avant le toggle "Ver todas las
// preguntas" (voir FaqAccordion). Les 5 premières sont les plus fréquentes ;
// le reste (accompagnement, coût additionnel) reste à un tap de distance.
const FAQ_INITIAL_VISIBLE_COUNT = 5

// FAQ générique pour l'étape pré-réservation (avant qu'une réservation
// existe) : pas de contenu lié à "ma reserva" ici, voir app/ayuda/page.tsx
// pour la FAQ post-réservation. Pas de question sur la vigencia (déjà
// couverte par VigenciaCard juste au-dessus, pas la peine de dupliquer) ni
// sur l'installation PWA (déjà couverte par le bouton "Instalar la app" en
// haut de page, voir InstallAppCard.tsx).
const FAQS: FaqAccordionItem[] = [
  {
    question: "¿Cómo elijo y reservo mi experiencia?",
    answer:
      "Te mostramos todas las experiencias disponibles para tu Vivabox. Puedes explorar, guardar tus favoritas y elegir la que más te guste. Cuando estés listo, selecciona una fecha y envía tu solicitud de reserva.",
  },
  {
    question: "¿Mi reserva queda confirmada de inmediato?",
    answer:
      "No todavía. Cuando eliges una fecha y hora, enviamos tu solicitud al lugar para confirmar que puede recibirte. La mayoría de las reservas se confirman en menos de 48 horas; si se necesita más tiempo, te avisaremos apenas tengamos una respuesta. Mientras tanto, puedes ver el estado de tu solicitud dentro de la app.",
  },
  {
    question: "¿Qué pasa si la experiencia o la fecha que quiero no está disponible?",
    answer:
      "Si la fecha que elegiste no está disponible, el lugar nos lo hace saber y te proponemos una alternativa para que la revises. Si ninguna fecha te funciona, también puedes explorar otras experiencias disponibles con tu Vivabox.",
  },
  {
    question: "¿Puedo cambiar mi experiencia o mi reserva?",
    answer:
      "Puedes cambiar de experiencia mientras tu reserva no esté confirmada. Si lo que quieres es cambiar la fecha, puedes solicitarlo directamente desde la app mientras tu solicitud siga en trámite; si tu reserva ya está confirmada, escríbenos por WhatsApp y revisamos contigo las opciones disponibles con el lugar.",
  },
  {
    question: "¿Qué pasa si necesito cancelar o no puedo asistir?",
    answer:
      "Escríbenos por WhatsApp lo antes posible y te contamos las opciones según la experiencia y el lugar reservado. Entre antes nos avises, más fácil será encontrar una alternativa.",
  },
  {
    question: "¿Puedo ir acompañado? ¿Cuántas personas pueden participar?",
    answer:
      "Depende de la experiencia. Cada una indica cuántas personas están incluidas en tu regalo y si admite personas adicionales; podrás verlo antes de reservar en el detalle de la experiencia. Cuando se permite ir acompañado, las personas extra quedan sujetas a disponibilidad y a un costo adicional.",
  },
  {
    question: "¿Hay algún costo adicional?",
    answer:
      "Tu Vivabox cubre la experiencia y la cantidad de personas incluidas que se indican en cada experiencia. Si decides llevar personas adicionales, cuando la experiencia lo permite, esas personas sí tienen un costo adicional y quedan sujetas a disponibilidad del lugar.",
  },
]

type VigenciaFetchState =
  | { kind: "loading" }
  | { kind: "unavailable" }
  | { kind: "ready"; info: VigenciaInfo }

// Même source que /api/codigo/context (purchaseDate = activation_codes.
// created_at, voir lib/utils/vigencia.ts) — auto-chargée ici plutôt que
// remontée par une prop, cette page étant la seule à en avoir besoin.
function useVigencia(): VigenciaFetchState {
  const [state, setState] = useState<VigenciaFetchState>({ kind: "loading" })

  useEffect(() => {
    let cancelled = false

    fetch("/api/codigo/context", { method: "POST", headers: { "Content-Type": "application/json" } })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data?.success && data.data?.purchaseDate) {
          setState({ kind: "ready", info: getVigenciaInfo(data.data.purchaseDate) })
        } else {
          setState({ kind: "unavailable" })
        }
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "unavailable" })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}

// Carte dédiée entre le titre et les FAQ — jamais de date inventée : en
// l'absence de purchaseDate on retombe sur le contact WhatsApp, jamais sur
// un calcul de substitution (activation, inscription...). Rien pendant le
// chargement (l'appel est quasi immédiat, pas la peine d'un skeleton).
function VigenciaCard({ state }: { state: VigenciaFetchState }) {
  if (state.kind === "loading") return null

  if (state.kind === "unavailable") {
    return (
      <a
        href={getWhatsAppLink("Hola, quisiera saber hasta cuándo puedo usar mi Vivabox.")}
        target="_blank"
        rel="noreferrer"
        style={{ ...cardStyle("#fff", "#E7E2DC"), display: "block", textDecoration: "none" }}
      >
        <div style={labelStyle("#9a9a9a")}>Vigencia</div>
        <div style={valueStyle("#152F40")}>Consulta la fecha de vencimiento</div>
      </a>
    )
  }

  const { info } = state
  const dateLabel = formatVigenciaDate(info.expiresAt)
  const colors =
    info.status === "urgent"
      ? { bg: "#FFF6E9", border: "#F2DFB8", text: "#8A5300" }
      : info.status === "expired"
      ? { bg: "#fff", border: "#E7E2DC", text: "#B42318" }
      : { bg: "#F1F7E9", border: "#E3EDD5", text: "#152F40" }

  return (
    <div style={cardStyle(colors.bg, colors.border)}>
      <div style={labelStyle(info.status === "expired" ? "#9a9a9a" : colors.text)}>
        {info.status === "urgent" && "⚠️ "}Vigencia
      </div>
      <div style={valueStyle(colors.text)}>
        {info.status === "expired" ? `Vencida el ${dateLabel}` : `Hasta el ${dateLabel}`}
      </div>
      {info.status !== "expired" && (
        <div
          style={{
            fontSize: 13,
            color: info.status === "active" ? "#5E7D22" : "#9a9a9a",
            marginTop: 2,
          }}
        >
          Te quedan <b>{info.daysRemaining}</b> día{info.daysRemaining === 1 ? "" : "s"}
        </div>
      )}
    </div>
  )
}

function cardStyle(bg: string, border: string): React.CSSProperties {
  return {
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  }
}

function labelStyle(color: string): React.CSSProperties {
  return { fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase", color }
}

function valueStyle(color: string): React.CSSProperties {
  return { fontSize: 18, fontWeight: 700, color, marginTop: 4 }
}

export default function AyudaGeneralPage() {
  const vigencia = useVigencia()
  const [showInstallModal, setShowInstallModal] = useState(false)
  // undefined pendant l'hydratation (isStandalone() a besoin de window) : le
  // bouton reste caché tant qu'on n'est pas sûr, plutôt que de flasher puis
  // disparaître pour qui a déjà l'app installée.
  const [canInstall, setCanInstall] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    setCanInstall(!isStandalone())
  }, [])

  return (
    <div
      style={{
        padding: "16px 16px 120px",
        background: "#FAF8F5",
        minHeight: "100vh",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, margin: 0 }}>Ayuda</h1>
        <BrandDots style={{ marginBottom: 0 }} />
      </div>

      {/* INSTALAR APP — compacte, juste sous le titre pour rester visible
          sans scroller ni prendre la place d'une card complète. */}
      {canInstall && (
        <button
          onClick={() => setShowInstallModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            width: "100%",
            padding: "10px 14px",
            marginBottom: 16,
            borderRadius: 14,
            border: "1px solid #E7E2DC",
            background: "#fff",
            color: "#152F40",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Download size={15} />
          Instalar la app
        </button>
      )}

      {/* VIGENCIA */}
      <VigenciaCard state={vigencia} />

      {/* FAQ */}
      <h3 style={{ margin: "4px 4px 12px", fontSize: 19 }}>Preguntas frecuentes</h3>
      <Card>
        <FaqAccordion items={FAQS} initialVisibleCount={FAQ_INITIAL_VISIBLE_COUNT} />
      </Card>

      {/* CONTACTO — escalada al soporte, se muestra más liviana que la FAQ */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 18,
          marginTop: 8,
          marginBottom: 20,
          border: "1px solid #E7E2DC",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 4, fontSize: 16, fontWeight: 600, color: "#333" }}>
          ¿Necesitas ayuda?
        </h3>
        <p style={{ color: "#666", fontSize: 13.5 }}>
          ¿No encontraste la respuesta? Escríbenos y te ayudamos.
        </p>

        <button
          className="vb-btn-primary"
          onClick={() => window.open(getWhatsAppLink("Hola, tengo una pregunta sobre Vivabox."), "_blank")}
          style={{
            marginTop: 12,
            width: "100%",
            padding: 14,
            borderRadius: 16,
            background: "#075E54",
            color: "#fff",
            border: "none",
            fontSize: 15,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            cursor: "pointer",
          }}
        >
          <MessageCircle size={16} />
          Escribir por WhatsApp
        </button>

        <a
          className="vb-btn-primary"
          href={`tel:+${WHATSAPP_NUMBER}`}
          style={{
            marginTop: 10,
            width: "100%",
            padding: 14,
            borderRadius: 16,
            background: "#F3EFEA",
            color: "#333",
            border: "1px solid #E7E2DC",
            fontSize: 15,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            textDecoration: "none",
            boxSizing: "border-box",
          }}
        >
          <Phone size={16} />
          Llamar
        </a>
      </div>

      {/* CUENTA */}
      <Card>
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 16,
            background: "#F3EFEA",
            color: "#B42318",
            border: "1px solid #E7E2DC",
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </Card>

      <InstallAppModal open={showInstallModal} onClose={() => setShowInstallModal(false)} />
    </div>
  )
}

/* ---------- UI ---------- */

function Card({ children }: any) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: 18,
        marginBottom: 20,
        boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </div>
  )
}
