"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUI } from "@/components/ui/UIContext"

export default function ActivarPage() {
  const router = useRouter()
  const { setHideNav } = useUI()

  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

  function handleActivate() {
    const cleaned = code.trim().toUpperCase()

    if (cleaned !== "VIVA-2026") {
      setError("Código inválido. Revisalo e intentá nuevamente.")
      return
    }

    // Code valide → accès app
    router.push("/activado")
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <h2 style={{ marginBottom: 12 }}>Ingresá tu código</h2>

      <input
        type="text"
        placeholder="XXXX-XXXX"
        value={code}
        onChange={(e) => {
          let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")

          if (value.length > 4) {
            value = value.slice(0, 4) + "-" + value.slice(4, 8)
          }

          setCode(value)
          setError("")
        }}
        style={{
          padding: 14,
          borderRadius: 10,
          border: "1px solid #ddd",
          fontSize: 16,
          letterSpacing: 2,
        }}
      />

      <p style={{ fontSize: 13, opacity: 0.6, marginTop: 8 }}>
        Lo encontrás dentro de tu cajita.
      </p>

      <p style={{ fontSize: 13, marginTop: 4 }}>
        Tu regalo ya está cubierto.
      </p>

      {error && (
        <p style={{ color: "red", marginTop: 10 }}>
          {error}
        </p>
      )}

      <button
        onClick={handleActivate}
        style={{
          marginTop: 28,
          padding: 14,
          borderRadius: 12,
          background: "#111",
          color: "white",
          border: "none",
          fontSize: 16,
        }}
      >
        Activar
      </button>
    </div>
  )
}
