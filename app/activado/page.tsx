"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUI } from "@/components/ui/UIContext"
import { Compass, Sparkles, CalendarDays } from "lucide-react"

export default function ActivadoPage() {
  const router = useRouter()
  const { setHideNav } = useUI()

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      {/* IMAGE */}
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

      {/* CARD */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2,
          width: "calc(100% - 48px)",
          maxWidth: 440,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.4)",
          padding: "42px 26px 34px",
          borderRadius: 26,
          boxShadow: "0 25px 60px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 40 }}>
          Tu regalo está activo
        </h2>

        {/* FLOW */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            marginBottom: 40,
          }}
        >
          <IconStep
            icon={<Compass size={34} />}
            label="Explorás"
            sub="Todo disponible"
          />

          <BigArrow />

          <IconStep
            icon={<Sparkles size={34} />}
            label="Elegís"
            sub="Una experiencia"
            highlight
          />

          <BigArrow />

          <IconStep
            icon={<CalendarDays size={34} />}
            label="Reservás"
            sub="Proponés fecha"
          />
        </div>

        <button
          onClick={() => router.push("/mapa")}
          style={{
            padding: 16,
            borderRadius: 14,
            background: "#111",
            color: "white",
            border: "none",
            fontSize: 17,
            fontWeight: 600,
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

function IconStep({
  icon,
  label,
  sub,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  sub: string
  highlight?: boolean
}) {
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div
        style={{
          width: 68,
          height: 68,
          margin: "0 auto 10px",
          borderRadius: 20,
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: highlight
            ? "0 0 0 6px rgba(0,0,0,0.04), 0 10px 26px rgba(0,0,0,0.12)"
            : "0 6px 18px rgba(0,0,0,0.08)",
          animation: highlight ? "pulse 2.4s ease-in-out infinite" : "none",
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 13, opacity: 0.6 }}>{sub}</div>
    </div>
  )
}

function BigArrow() {
  return (
    <div
      style={{
        fontSize: 54,
        opacity: 0.35,
        transform: "translateY(-30px)",
      }}
    >
      →
    </div>
  )
}
