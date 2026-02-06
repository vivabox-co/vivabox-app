"use client"

import { useEffect, useRef } from "react"
import { useUI } from "@/components/ui/UIContext"
import { useRouter } from "next/navigation"

export default function ConfirmacionPage() {
  const {
    setHideNav,
    selectedExperience,
    selectedDate,
    selectedTime,
  } = useUI()

  const router = useRouter()
  const bookingCreated = useRef(false)

  useEffect(() => {
    setHideNav(true)

    console.log("CONFIRM DATA →", {
      selectedExperience,
      selectedDate,
      selectedTime,
    })

    // 🔴 Protection : si données manquantes → retour
    if (!selectedExperience || !selectedDate || !selectedTime) {
      console.error("❌ Booking impossible: données manquantes")
      return
    }

    // Empêche double exécution du useEffect
    if (bookingCreated.current) return
    bookingCreated.current = true

    const booking = {
      id: Date.now().toString(),
      experience: selectedExperience,
      date: selectedDate,
      time: selectedTime,
      step: 1,
    }

    localStorage.setItem("currentBooking", JSON.stringify(booking))

    return () => setHideNav(false)
  }, [selectedExperience, selectedDate, selectedTime, setHideNav])

  // 🧱 Écran erreur si données absentes
  if (!selectedExperience || !selectedDate || !selectedTime) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Error en la reserva</h2>
        <p>No se recibieron correctamente las fechas o la experiencia.</p>
        <button
          onClick={() => router.push("/mapa")}
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 10,
            background: "#111",
            color: "white",
            border: "none",
          }}
        >
          Volver a empezar
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: 24,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: 12 }}>Listo, ya lo estamos coordinando</h2>

      <p style={{ opacity: 0.7 }}>
        Recibimos tus fechas y estamos verificando disponibilidad con el lugar.
      </p>

      <p style={{ marginTop: 16, fontWeight: 500 }}>
        Te confirmamos en máximo 48 horas.
      </p>

      <button
        onClick={() => {
          const stored = localStorage.getItem("currentBooking")
          if (!stored) return
          const booking = JSON.parse(stored)
          router.push(`/reservar/seguimiento/${booking.id}`)
        }}
        style={{
          marginTop: 40,
          padding: 14,
          borderRadius: 12,
          background: "#111",
          color: "white",
          border: "none",
          fontSize: 16,
        }}
      >
        Ver seguimiento de mi experiencia
      </button>
    </div>
  )
}
