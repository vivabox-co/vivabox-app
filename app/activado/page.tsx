"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUI } from "@/components/ui/UIContext"
import { Compass, Heart, CalendarDays } from "lucide-react"

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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🌅 IMAGE AMBIANCE */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/image/image_activado.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(5px) brightness(1.05)",
          transform: "scale(1.04)",
          zIndex: 0,
        }}
      />

      {/* 🧩 CARTE TRANSPARENTE */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2,
          width: "calc(100% - 48px)",
          maxWidth: 440,
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.4)",
          padding: "32px 26px 26px",
          borderRadius: 26,
          boxShadow: "0 25px 60px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        {/* 🎉 TITRE */}
        <h2 style={{ fontSize: 26, fontWeight: 650, marginBottom: 14 }}>
          Tu regalo está listo
        </h2>

        {/* ✨ INTRO */}
        <p
          style={{
            fontSize: 16,
            opacity: 0.85,
            marginBottom: 22,
            lineHeight: 1.5,
          }}
        >
          Podés explorar todas las experiencias disponibles y elegir la que más te guste.
        </p>

        {/* 🧭 MINI GUIDE AVEC ICÔNES */}
        <div
          style={{
            textAlign: "left",
            fontSize: 15,
            lineHeight: 1.7,
            marginBottom: 22,
            opacity: 0.92,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Compass size={18} /> Explorá experiencias
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Heart size={18} /> Elegí la que más te guste
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CalendarDays size={18} /> Proponé fechas
          </div>
        </div>

        {/* 🧘 MICRO RASSURANCE */}
        <p style={{ fontSize: 14, opacity: 0.65, marginBottom: 26 }}>
          No estás reservando todavía.
        </p>

        {/* 🔘 CTA */}
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
            width: "100%",
            boxShadow: "0 12px 28px rgba(0,0,0,0.16)",
          }}
        >
          Ver experiencias
        </button>
      </div>
    </div>
  )
}
