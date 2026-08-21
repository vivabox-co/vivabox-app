"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Check } from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import { useUI } from "@/components/ui/UIContext"

function ConfirmacionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setHideNav, selectedExperience } = useUI()
  const bookingId = searchParams.get("bookingId")
  const [bookedImage, setBookedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [setHideNav])

  useEffect(() => {
    if (!bookingId) {
      router.replace("/mapa")
      return
    }
    localStorage.setItem("currentBooking", JSON.stringify({ id: bookingId }))

    // La photo de l'expérience vient de selectedExperience (état mémoire, pas
    // fiable après un refresh), donc on la reconfirme via le snapshot renvoyé
    // par la réservation elle-même — la vraie source de vérité. La session
    // vit dans le cookie vb_session, envoyé automatiquement.
    fetch(`/api/booking/${bookingId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.experienceSnapshot?.image) {
          setBookedImage(data.data.experienceSnapshot.image)
        }
      })
      .catch(() => {})
  }, [bookingId, router])

  if (!bookingId) return null

  const heroImage = bookedImage || selectedExperience?.image || "/image/image_welcome.webp"

  return (
    <div style={wrapperStyle}>
      <div
        style={{
          ...bgImage,
          backgroundImage: `url(${heroImage})`,
        }}
      />
      <div style={bgOverlay} />

      <div style={contentStyle}>
        <div style={cardWide}>
          <div style={checkCircle}>
            <Check size={54} strokeWidth={3} color="#1E7A3B" />
          </div>

          <h2 style={h2}>Listo, ya está en marcha</h2>

          <p style={text}>
            <strong>Ya lo estamos coordinando con el lugar.</strong><br />
            Solo prepárate para disfrutar.
          </p>

          <button
            onClick={() => {
              if (loading) return
              setLoading(true)
              router.push(`/reservar/seguimiento/${bookingId}`)
            }}
            className="vb-btn-primary"
            style={btnStyle}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="vb-spinner-light" />
                Cargando...
              </>
            ) : (
              "Ver seguimiento"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmacionContent />
    </Suspense>
  )
}

/* ================= STYLES ================= */

const wrapperStyle: React.CSSProperties = {
  minHeight: "100dvh",
  position: "relative",
  overflow: "hidden",
}

const bgImage: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundSize: "cover",
  backgroundPosition: "center",
  transform: "scale(1.05)",
  zIndex: 0,
}

const bgOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backdropFilter: "blur(6px)",
  background: "rgba(255,255,255,0.25)",
  zIndex: 1,
}

const contentStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100dvh",
  padding: "32px 24px",
}

const cardWide: React.CSSProperties = {
  maxWidth: 440,
  width: "100%",
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.4)",
  padding: "42px 26px 34px",
  borderRadius: 26,
  boxShadow: "0 25px 60px rgba(0,0,0,0.08)",
  textAlign: "center",
}

const checkCircle: React.CSSProperties = {
  width: 110,
  height: 110,
  borderRadius: "50%",
  border: "3px solid #1E7A3B",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 26px",
}

const h2: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 16,
}

const text: React.CSSProperties = {
  fontSize: 16,
  opacity: 0.7,
  lineHeight: 1.5,
  marginBottom: 34,
}

const btnStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px 20px",
  borderRadius: 14,
  background: "#152F40",
  color: "white",
  border: "none",
  fontSize: 17,
  fontWeight: 600,
  boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
}
