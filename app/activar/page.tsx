"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUI } from "@/components/ui/UIContext"
import { prefersReducedMotion } from "@/lib/utils/prefersReducedMotion"
import { useNextCardMinHeight } from "@/components/ui/useNextCardMinHeight"
import { DatosCardBody } from "@/app/activar/datos/page"

const CARD_TRANSITION_MS = 500

// Le spinner + "Comenzando..." doivent rester visibles, carte immobile,
// avant que celle-ci commence à glisser — sinon ils apparaissent déjà en
// train de sortir de l'écran en même temps que la carte et ne se voient
// quasiment pas (contrairement au spinner de /activar/datos, visible
// pendant tout un appel réseau, carte fixe).
const LOADING_PAUSE_MS = 180

// Aperçu statique (aucune interaction réelle) de la carte "Activemos tu
// experiencia" : état initial, toujours identique quel que soit ce que
// l'utilisateur tapera une fois sur la vraie page /activar/datos.
const NOOP = () => {}

export default function ActivarFlowPage() {
  const router = useRouter()
  const { setHideNav } = useUI()
  const [loading, setLoading] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const { ref: nextCardRef, minHeight: nextCardMinHeight } = useNextCardMinHeight(leaving)

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

  const handleContinue = () => {
    if (loading) return

    if (prefersReducedMotion()) {
      router.push("/activar/datos")
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLeaving(true)
      setTimeout(() => router.push("/activar/datos"), CARD_TRANSITION_MS)
    }, LOADING_PAUSE_MS)
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
            <WelcomeCard onFinish={handleContinue} loading={loading} />
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

function WelcomeCard({ onFinish, loading }: { onFinish: () => void; loading: boolean }) {
  return (
    <div style={cardSoft}>
      <h1 style={headline}>
        <span style={headlineIntro}>Te hicieron un regalo.</span>
        <span style={headlineMain}>
          Ahora <span style={headlineAccent}>eliges tú</span> la experiencia.
        </span>
      </h1>

      <p style={pMain}>
        Descubre las experiencias disponibles para ti.
      </p>

      <button
        onClick={onFinish}
        className="vb-btn-primary"
        style={btnStyle}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="vb-spinner-light" />
            Comenzando...
          </>
        ) : (
          "Empezar"
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

const headline: React.CSSProperties = {
  marginBottom: 18,
}

const headlineIntro: React.CSSProperties = {
  display: "block",
  fontSize: "clamp(19px, 5.2vw, 22px)",
  fontWeight: 600,
  color: "#152F40",
  lineHeight: 1.25,
  marginBottom: 12,
}

const headlineMain: React.CSSProperties = {
  display: "block",
  fontSize: "clamp(24px, 7vw, 28px)",
  fontWeight: 700,
  color: "#152F40",
  lineHeight: 1.08,
}

const headlineAccent: React.CSSProperties = {
  color: "#FE842F",
}

const pMain: React.CSSProperties = {
  fontSize: "clamp(16px, 4.5vw, 18px)",
  fontWeight: 400,
  color: "#152F40",
  opacity: 0.72,
  maxWidth: "88%",
  marginLeft: "auto",
  marginRight: "auto",
  marginBottom: 30,
  lineHeight: 1.55,
}

const btnStyle: React.CSSProperties = {
  height: 54,
  borderRadius: 16,
  background: "#152F40",
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