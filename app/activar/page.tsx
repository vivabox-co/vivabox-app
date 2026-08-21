"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUI } from "@/components/ui/UIContext"
import { prefersReducedMotion } from "@/lib/utils/prefersReducedMotion"
import { useNextCardMinHeight } from "@/components/ui/useNextCardMinHeight"
import { DatosCardBody } from "@/app/activar/datos/page"

const CARD_TRANSITION_MS = 500

// Aperçu statique (aucune interaction réelle) de la carte "Activemos tu
// experiencia" : état initial, toujours identique quel que soit ce que
// l'utilisateur tapera une fois sur la vraie page /activar/datos.
const NOOP = () => {}

export default function ActivarFlowPage() {
  const router = useRouter()
  const { setHideNav } = useUI()
  const [leaving, setLeaving] = useState(false)
  const { ref: nextCardRef, minHeight: nextCardMinHeight } = useNextCardMinHeight(leaving)

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

  const handleContinue = () => {
    if (leaving) return

    if (prefersReducedMotion()) {
      router.push("/activar/datos")
      return
    }

    setLeaving(true)
    setTimeout(() => router.push("/activar/datos"), CARD_TRANSITION_MS)
  }

  return (
    <div style={container}>

      {/* BACKGROUND */}
      <div style={bgImage} />
      <div style={bgOverlay} />

      {/* CONTENT */}
      <div style={centerWrap}>
        <img
          src="/logo/LogoVivaboxSVG.svg"
          alt="Vivabox"
          style={logo}
        />

        <div
          style={{
            "--vb-activation-duration": `${CARD_TRANSITION_MS}ms`,
            minHeight: nextCardMinHeight ? `${nextCardMinHeight}px` : undefined,
          } as React.CSSProperties}
          className="vb-activation-viewport"
        >
          {/* Carte actuelle : reste en flux normal (donne sa hauteur au
              viewport) et glisse en entier vers la gauche à la sortie. */}
          <div
            className="vb-activation-card-current"
            style={{
              transform: leaving ? "translateX(-100%)" : "translateX(0)",
              opacity: leaving ? 0.92 : 1,
            }}
          >
            <WelcomeCard onFinish={handleContinue} leaving={leaving} />
          </div>

          {/* Carte suivante : montée déjà entièrement construite (aperçu
              statique, non interactif, de l'écran d'activation du code)
              et glisse depuis la droite en même temps que l'autre sort.
              ref mesuré par useNextCardMinHeight pour agrandir le viewport
              si elle est plus haute que la carte actuelle (évite qu'elle
              soit coupée par overflow:hidden). */}
          {leaving && (
            <div className="vb-activation-card-next" ref={nextCardRef} aria-hidden="true">
              <DatosCardBody
                codigo=""
                nombre=""
                apellido=""
                email=""
                error=""
                loading={false}
                disabled
                onCodigoChange={NOOP}
                onNombreChange={NOOP}
                onApellidoChange={NOOP}
                onEmailChange={NOOP}
                onSubmit={(e) => e.preventDefault()}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function WelcomeCard({ onFinish, leaving }: { onFinish: () => void; leaving: boolean }) {
  return (
    <div style={cardSoft}>
      <h1 style={h1}>Te hicieron un regalo especial</h1>

      <p style={pMain}>
        Podés elegir la experiencia que más te guste y vivir un gran momento.
      </p>

      <p style={pSub}>
        Activá tu experiencia para empezar.
      </p>

      <button
        onClick={onFinish}
        className="vb-btn-primary"
        style={btnStyle}
        disabled={leaving}
      >
        {leaving ? (
          <>
            <span className="vb-spinner-light" />
            Comenzando...
          </>
        ) : (
          "Comenzar"
        )}
      </button>
    </div>
  )
}

/* ============================= */
/* STYLES */
/* ============================= */

const container: React.CSSProperties = {
  minHeight: "100dvh",
  position: "relative",
  overflow: "hidden",
}

const bgImage: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage: "url('/image/image_welcome.webp')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  transform: "scale(1.05)",
  zIndex: 0,
}

const bgOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backdropFilter: "blur(6px)",
  background: "rgba(255,255,255,0.25)",
  zIndex: 1,
}

const logo: React.CSSProperties = {
  width: 100,
  height: "auto",
  display: "block",
}

const centerWrap: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "24px",
  padding: "32px 24px",
  paddingBottom: "12vh",
  boxSizing: "border-box",
}

const cardSoft: React.CSSProperties = {
  maxWidth: 420,
  width: "100%",
  margin: "0 auto",
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(14px)",
  padding: "44px 24px 40px",
  borderRadius: 26,
  boxShadow: "0 30px 80px rgba(0,0,0,0.12)",
  textAlign: "center",
}

const h1: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 650,
  marginBottom: 24,
  lineHeight: 1.3,
}

const pMain: React.CSSProperties = {
  fontSize: 16,
  opacity: 0.85,
  marginBottom: 26,
  lineHeight: 1.7,
}

const pSub: React.CSSProperties = {
  fontSize: 14,
  opacity: 0.6,
  marginBottom: 40,
  lineHeight: 1.6,
}

const btnStyle: React.CSSProperties = {
  height: 54,
  borderRadius: 16,
  background: "#111",
  color: "white",
  border: "none",
  fontSize: 16,
  fontWeight: 600,
  width: "100%",
  cursor: "pointer",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
}