"use client"

import { useEffect } from "react"

// Error boundary de segment : capte toute erreur de rendu/JS dans une page
// (données mal formées, expérience introuvable, API en panne...) et affiche
// un écran de récupération Vivabox au lieu de la page d'erreur générique de
// Next.js. Le détail technique part en console pour le debug, jamais à l'écran.
export default function ErrorBoundary({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={container}>
      <div style={card}>
        <img src="/logo/LogoVivaboxSVG.svg" alt="Vivabox" style={logo} />
        <h1 style={title}>Ups, algo no salió como esperábamos</h1>
        <p style={text}>Vamos a llevarte de nuevo a un lugar seguro.</p>
        <a href="/activar" style={button}>
          Volver a activar mi Vivabox
        </a>
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 24px",
  background: "#f5f5f5",
  boxSizing: "border-box",
}

const card: React.CSSProperties = {
  maxWidth: 420,
  width: "100%",
  background: "#fff",
  padding: "36px 24px 28px",
  borderRadius: 26,
  boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
  textAlign: "center",
}

const logo: React.CSSProperties = {
  width: 72,
  height: "auto",
  display: "block",
  margin: "0 auto 24px",
}

const title: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 650,
  lineHeight: 1.3,
  marginBottom: 12,
}

const text: React.CSSProperties = {
  fontSize: 15,
  opacity: 0.65,
  lineHeight: 1.5,
  marginBottom: 28,
}

const button: React.CSSProperties = {
  display: "block",
  height: 52,
  lineHeight: "52px",
  borderRadius: 14,
  background: "#111",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  textDecoration: "none",
  boxShadow: "0 10px 26px rgba(0,0,0,0.18)",
}
