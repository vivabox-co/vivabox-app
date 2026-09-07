"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

// Écran affiché par le middleware quand la vérification de session échoue
// pour une raison technique (timeout/réseau/panne Supabase — voir
// resolveSessionContext dans middleware.ts), PAS quand la session est
// réellement invalide. Le cookie vb_session n'a pas été touché : on ne fait
// que réessayer la même navigation, jamais renvoyer vers /activar.
export default function ReintentarPage() {
  return (
    <Suspense fallback={null}>
      <ReintentarContent />
    </Suspense>
  )
}

function ReintentarContent() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/mapa"
  const [retrying, setRetrying] = useState(false)

  const retry = () => {
    setRetrying(true)
    // Navigation dure (pas router.push) pour repasser par le middleware et
    // relancer une vraie vérification côté serveur.
    window.location.href = next
  }

  useEffect(() => {
    const timer = setTimeout(retry, 4000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={container}>
      <div style={card}>
        <img src="/logo/LogoVivaboxSVG.svg" alt="Vivabox" style={logo} />
        <h1 style={title}>Problema de conexión</h1>
        <p style={text}>
          No pudimos verificar tu sesión — probablemente por una conexión
          inestable. Tu código sigue activo, solo hace falta reintentar.
        </p>
        <button onClick={retry} style={button} disabled={retrying}>
          {retrying ? "Reintentando..." : "Reintentar"}
        </button>
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
  width: "100%",
  height: 52,
  lineHeight: "52px",
  borderRadius: 14,
  background: "#152F40",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  border: "none",
  boxShadow: "0 10px 26px rgba(0,0,0,0.18)",
  cursor: "pointer",
}
