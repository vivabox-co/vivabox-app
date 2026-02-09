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

    router.push("/activado")
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "32px 24px",
        paddingTop: "12vh",
        paddingBottom: "20vh",
        overflow: "hidden",
      }}
    >
      {/* 🌅 IMAGE AMBIANCE */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/image/image_activar.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(6px) brightness(1.03)",
          transform: "scale(1)",
          zIndex: 0,
        }}
      />

      {/* 🧩 CARTE DE LECTURE */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2,
          width: "calc(100% - 48px)", // 24px marge de chaque côté
          maxWidth: 420,
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.35)",
          padding: "28px 22px 24px",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 600, marginBottom: 18 }}>
          Ingresá tu código
        </h2>

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
            borderRadius: 12,
            border: "1px solid #ddd",
            fontSize: 16,
            letterSpacing: 2,
            width: "100%",
          }}
        />

        <p style={{ fontSize: 17, opacity: 0.65, marginTop: 10 }}>
          Lo encontrás dentro de tu cajita.
        </p>

        <p style={{ fontSize: 15, marginTop: 4, opacity: 0.8 }}>
          Tu regalo ya está cubierto.
        </p>

        {error && (
          <p style={{ color: "#c0392b", marginTop: 12, fontSize: 14 }}>
            {error}
          </p>
        )}

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
            fontWeight: 500,
            cursor: "pointer",
            width: "100%",
            boxShadow: "0 10px 26px rgba(0,0,0,0.15)",
          }}
        >
          Activar
        </button>
      </div>
    </div>
  )
}
