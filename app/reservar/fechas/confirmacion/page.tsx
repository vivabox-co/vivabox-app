"use client"

import { useEffect } from "react"
import { useUI } from "@/components/ui/UIContext"
import { useRouter } from "next/navigation"

export default function ConfirmacionPage() {
  const { setHideNav } = useUI()
  const router = useRouter()

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

  return (
    <div
      style={{
        padding: 24,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: 12 }}>Listo, ya lo estamos coordinando</h2>

      <p style={{ opacity: 0.7 }}>
        Recibimos tus fechas y estamos verificando disponibilidad con el lugar.
      </p>

      <p style={{ marginTop: 16, fontWeight: 500 }}>
        Te confirmamos en máximo 48 horas.
      </p>

      <button
        onClick={() => router.push("/mapa")}
        style={{
          marginTop: 40,
          padding: 14,
          borderRadius: 12,
          background: "#111",
          color: "white",
          border: "none",
          fontSize: 16,
        }}
      >
        Volver a explorar experiencias
      </button>
    </div>
  )
}
