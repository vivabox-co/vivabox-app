"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUI } from "@/components/ui/UIContext"

export default function ActivadoPage() {
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
        padding: 24,
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: 16 }}>
        Tu regalo está listo
      </h2>

      <p
        style={{
          fontSize: 15,
          opacity: 0.7,
          marginBottom: 36,
          lineHeight: 1.5,
        }}
      >
        Elegí la experiencia que más te guste y proponé fechas.
      </p>

      <button
        onClick={() => router.push("/mapa")}
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
        Ver experiencias
      </button>
    </div>
  )
}
