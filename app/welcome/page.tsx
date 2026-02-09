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
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "32px 24px",
        paddingTop: "10vh",
        paddingBottom: "20vh",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* 🌅 IMAGE AMBIANCE */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/image/image_welcome.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "scale(1.02)",
          zIndex: 0,
        }}
      />

      {/* 🔶 LOGO FLOTTANT */}
      <img
        src="/logo/LogoVivaboxSVG.svg"
        alt="Vivabox"
        style={{
          width: 110,
          marginBottom: 24,
          zIndex: 2,
        }}
      />

      {/* 🧩 CARTE DE LECTURE */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 420,
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(0px)",
          WebkitBackdropFilter: "blur(12px)",
          padding: "28px 22px 22px",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        }}
      >
        {/* 🟢 TITRE */}
        <h1 style={{ fontSize: 28, fontWeight: 650, marginBottom: 18 }}>
          Te hicieron un regalo especial
        </h1>

        {/* ✨ PROMESSE */}
        <p
          style={{
            fontSize: 17,
            opacity: 0.85,
            marginBottom: 18,
            lineHeight: 1.5,
          }}
        >
          Podés elegir la experiencia que más te guste y vivir un gran momento.
        </p>

        {/* 🧭 MICRO DIRECTION */}
        <p
          style={{
            fontSize: 15,
            opacity: 0.65,
            marginBottom: 32,
          }}
        >
          Activá tu experiencia para empezar.
        </p>

        {/* 🔘 BOUTON */}
        <button
          onClick={() => router.push("/activar")}
          style={{
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
          Comenzar
        </button>
      </div>
    </div>
  )
}
