"use client"

import { useRouter } from "next/navigation"
import { useUI } from "@/components/ui/UIContext"
import { useEffect } from "react"

export default function WelcomePage() {
  const router = useRouter()
  const { setHideNav } = useUI()

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 16 }}>
        Te regalaron una experiencia
      </h1>

      <p
        style={{
          fontSize: 16,
          opacity: 0.7,
          marginBottom: 40,
          lineHeight: 1.5,
        }}
      >
        Activá tu código para ver los planes que podés elegir.
      </p>

      <button
        onClick={() => router.push("/activar")}
        style={{
          padding: 16,
          borderRadius: 14,
          background: "#111",
          color: "white",
          border: "none",
          fontSize: 16,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Comenzar
      </button>
    </div>
  )
}
