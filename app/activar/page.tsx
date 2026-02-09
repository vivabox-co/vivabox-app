"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUI } from "@/components/ui/UIContext"

export default function ActivarPage() {
  const router = useRouter()
  const { setHideNav } = useUI()

  const [code, setCode] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
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

    if (!email || !name) {
      setError("Completá tu nombre y email para continuar.")
      return
    }

    router.push("/activado")
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        overflow: "hidden",
      }}
    >
      {/* IMAGE */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/image/image_activar.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(6px) brightness(1.05)",
          zIndex: 0,
        }}
      />

      {/* CARD */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.4)",
          padding: "30px 24px 26px",
          borderRadius: 26,
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        {/* TITLE */}
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>
          Activemos tu experiencia
        </h2>

        {/* CODE */}
        <label style={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }}>
          Código Vivabox
        </label>
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
            marginTop: 6,
            padding: 14,
            borderRadius: 12,
            border: "1px solid #ddd",
            fontSize: 16,
            letterSpacing: 2,
            width: "100%",
          }}
        />

        <p style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
          Está dentro de tu cajita.
        </p>

        {/* USER INFO */}
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
            Tus datos
          </p>

          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #ddd",
              fontSize: 15,
              width: "100%",
              marginBottom: 10,
            }}
          />

          <input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #ddd",
              fontSize: 15,
              width: "100%",
            }}
          />

          <p style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
            Solo para coordinar tu experiencia
          </p>
        </div>

        {/* REASSURANCE */}
        <div
          style={{
            marginTop: 22,
            padding: "12px 14px",
            borderRadius: 14,
            background: "#EAF7EF",
            fontSize: 15,
            fontWeight: 700,
            color: "#1E7A3B",
          }}
        >
          Tu regalo ya está cubierto
        </div>

        {error && (
          <p style={{ color: "#c0392b", marginTop: 12, fontSize: 14 }}>
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={handleActivate}
          style={{
            marginTop: 26,
            padding: 16,
            borderRadius: 14,
            background: "#111",
            color: "white",
            border: "none",
            fontSize: 17,
            fontWeight: 700,
            cursor: "pointer",
            width: "100%",
            boxShadow: "0 10px 26px rgba(0,0,0,0.15)",
          }}
        >
          Activar mi experiencia
        </button>
      </div>
    </div>
  )
}
