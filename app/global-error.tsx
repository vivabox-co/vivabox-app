"use client"

import { useEffect } from "react"

// Filet de sécurité ultime : ne se déclenche que si le layout racine
// lui-même plante. Remplace tout l'arbre (y compris <html>/<body>), donc
// reste volontairement autonome — pas d'import de globals.css ni de
// composants de l'app, tout est en ligne pour rester fiable même quand le
// reste du rendu est cassé.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 24px",
            background: "#f5f5f5",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              maxWidth: 420,
              width: "100%",
              background: "#fff",
              padding: "36px 24px 28px",
              borderRadius: 26,
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <img
              src="/logo/LogoVivaboxSVG.svg"
              alt="Vivabox"
              style={{ width: 72, height: "auto", display: "block", margin: "0 auto 24px" }}
            />
            <h1 style={{ fontSize: 22, fontWeight: 650, lineHeight: 1.3, margin: "0 0 12px" }}>
              Ups, algo no salió como esperábamos
            </h1>
            <p style={{ fontSize: 15, opacity: 0.65, lineHeight: 1.5, margin: "0 0 28px" }}>
              Vamos a llevarte de nuevo a un lugar seguro.
            </p>
            <a
              href="/activar"
              style={{
                display: "block",
                height: 52,
                lineHeight: "52px",
                borderRadius: 14,
                background: "#152F40",
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 10px 26px rgba(0,0,0,0.18)",
              }}
            >
              Volver a activar mi Vivabox
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
