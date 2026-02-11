"use client"

import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { useEffect, useState } from "react"
import { useUI } from "@/components/ui/UIContext"
import { Experience } from "@/lib/data/types"
import { generateId } from "@/lib/utils/generateId"
import { BookingStatus } from "@/components/ui/BookingTimeline"

export default function ConfirmacionPage() {
  const router = useRouter()
  const { setHideNav, selectedExperience } = useUI()
  const [experience, setExperience] = useState<Experience | null>(null)

  useEffect(() => {
    setHideNav(true)

    if (selectedExperience) {
      setExperience(selectedExperience)

      const dateStored = localStorage.getItem("selectedDates")
      const timeStored = localStorage.getItem("selectedTime")

      const booking = {
        id: generateId(), // ✅ ID propre
        experienceId: selectedExperience.id,
        date: dateStored ? JSON.parse(dateStored)[0] : null,
        time: timeStored ? JSON.parse(timeStored)[0] : null,
        status: "requested" as BookingStatus,

        experienceSnapshot: {
          id: selectedExperience.id,
          title: selectedExperience.title,
          image: selectedExperience.image,
          zone: selectedExperience.zone,
          category: selectedExperience.category,
          providerName: selectedExperience.providerName,
        },
      }

      localStorage.setItem("currentBooking", JSON.stringify(booking))
    }

    return () => setHideNav(false)
  }, [selectedExperience, setHideNav])

  return (
    <div style={wrapperStyle}>
      <div
        style={{
          ...backgroundStyle,
          backgroundImage: experience ? `url(${experience.image})` : "none",
        }}
      />

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
            onClick={() => router.push("/reservar/seguimiento/" + (experience?.id || "1"))}
            style={btnStyle}
          >
            Ver seguimiento
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const wrapperStyle: React.CSSProperties = {
  minHeight: "100dvh",
  position: "relative",
  overflow: "hidden",
}

const backgroundStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundSize: "cover",
  backgroundPosition: "center",
  filter: "blur(8px) brightness(0.9)",
  transform: "scale(1.05)",
  zIndex: 0,
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
  background: "#111",
  color: "white",
  border: "none",
  fontSize: 17,
  fontWeight: 600,
  boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
  cursor: "pointer",
}
