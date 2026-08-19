"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUI } from "@/components/ui/UIContext"
import { prefersReducedMotion } from "@/lib/utils/prefersReducedMotion"

const CARD_TRANSITION_MS = 500

export default function ActivarFlowPage() {
  const router = useRouter()
  const { setHideNav } = useUI()
  const [leaving, setLeaving] = useState(false)

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
        <WelcomeCard onFinish={handleContinue} leaving={leaving} />
      </div>
    </div>
  )
}

function WelcomeCard({ onFinish, leaving }: { onFinish: () => void; leaving: boolean }) {
  return (
    <div style={cardSoft}>
      <div style={cardViewport} className="vb-activation-viewport">
        <div
          style={cardContent}
          className={leaving ? "vb-activation-content--exit" : undefined}
        >
          <h1 style={h1}>Te hicieron un regalo especial</h1>

          <p style={pMain}>
            Podés elegir la experiencia que más te guste y vivir un gran momento.
          </p>

          <p style={pSub}>
            Activá tu experiencia para empezar.
          </p>

          <button onClick={onFinish} style={btnStyle} disabled={leaving}>
            Comenzar
          </button>
        </div>
      </div>
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
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(14px)",
  borderRadius: 26,
  boxShadow: "0 30px 80px rgba(0,0,0,0.12)",
  textAlign: "center",
}

const cardViewport: React.CSSProperties = {
  borderRadius: 26,
}

const cardContent: React.CSSProperties = {
  padding: "32px 24px 24px",
}

const h1: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 650,
  marginBottom: 18,
  lineHeight: 1.2,
}

const pMain: React.CSSProperties = {
  fontSize: 16,
  opacity: 0.85,
  marginBottom: 18,
  lineHeight: 1.5,
}

const pSub: React.CSSProperties = {
  fontSize: 14,
  opacity: 0.6,
  marginBottom: 28,
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
  transition: "transform 0.1s ease",
}