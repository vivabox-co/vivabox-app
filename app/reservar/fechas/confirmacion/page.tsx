"use client"

import { useRouter } from "next/navigation"
import { Check } from "lucide-react"

export default function ConfirmacionPage() {
  const router = useRouter()

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF8F5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* ✅ ICON VALIDATION ÉLÉGANT */}
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            border: "3px solid #1E7A3B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <Check size={54} strokeWidth={3} color="#1E7A3B" />
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 14,
            lineHeight: 1.2,
          }}
        >
          Listo, ya lo estamos coordinando
        </h1>

        <p
          style={{
            fontSize: 16,
            opacity: 0.65,
            lineHeight: 1.5,
            marginBottom: 36,
          }}
        >
          Vivabox está gestionando tu solicitud con el lugar.  
          Te avisaremos muy pronto con la confirmación.
        </p>

        <button
          onClick={() => router.push("/reservar/seguimiento/1")}
          style={{
            width: "100%",
            padding: "16px 20px",
            borderRadius: 14,
            background: "#111",
            color: "white",
            border: "none",
            fontSize: 17,
            fontWeight: 600,
            boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
            cursor: "pointer",
          }}
        >
          Ver seguimiento
        </button>
      </div>
    </div>
  )
}
