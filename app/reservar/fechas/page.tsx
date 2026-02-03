"use client"

import { useState, useEffect } from "react"
import { useUI } from "@/components/ui/UIContext"
import { useRouter } from "next/navigation"

export default function FechasPage() {
  const { selectedExperience, setHideNav, setDrawerOpen } = useUI()
  const router = useRouter()

  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [people, setPeople] = useState(1)
  const [phone, setPhone] = useState("")

  const [alt1Date, setAlt1Date] = useState("")
  const [alt1Time, setAlt1Time] = useState("")
  const [alt2Date, setAlt2Date] = useState("")
  const [alt2Time, setAlt2Time] = useState("")

  const [showAlt1, setShowAlt1] = useState(false)
  const [showAlt2, setShowAlt2] = useState(false)

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

  if (!selectedExperience) {
    return (
      <div style={{ padding: 20 }}>
        <p>No hay experiencia seleccionada.</p>
        <button onClick={() => router.push("/")}>Volver</button>
      </div>
    )
  }

  function handleSubmit() {
    if (!date || !time || !phone) {
      alert("Completa los campos obligatorios")
      return
    }

    const bookingData = {
      experienceId: selectedExperience!.id,
      primary: { date, time },
      alt1: alt1Date ? { date: alt1Date, time: alt1Time } : null,
      alt2: alt2Date ? { date: alt2Date, time: alt2Time } : null,
      people,
      phone,
    }

    console.log("BOOKING:", bookingData)
    router.push("/reservar/confirmacion")
  }

  return (
    <div
      style={{
        padding: 16,
        height: "100vh",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        paddingBottom: "120px", // espace réel pour le bouton

      }}
    >
      {/* BACK */}
      <button
        onClick={() => {
          setHideNav(false)
          setDrawerOpen(true)
          router.push("/mapa")
        }}
        style={{
          background: "none",
          border: "none",
          fontSize: 22,
          marginBottom: 10,
          cursor: "pointer",
        }}
      >
        ←
      </button>

      <img
        src={selectedExperience.image}
        alt={selectedExperience.title}
        style={{ width: "100%", borderRadius: 12 }}
      />

      <h2 style={{ marginTop: 12 }}>{selectedExperience.title}</h2>
      <p style={{ opacity: 0.6 }}>{selectedExperience.zone}</p>

      <div style={{ marginTop: 24 }}>
        <h3>Proponé tu fecha ideal</h3>
        <p style={{ fontSize: 14, opacity: 0.6 }}>
          Vivabox coordina la disponibilidad con el lugar.
        </p>
      </div>

      {/* FECHA PRINCIPAL */}
      <div style={{ marginTop: 20 }}>
        <label>Fecha *</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Hora de inicio *</label>
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        >
          <option value="">Seleccionar</option>
          <option>08:00</option>
          <option>10:00</option>
          <option>12:00</option>
          <option>14:00</option>
          <option>16:00</option>
          <option>18:00</option>
        </select>
      </div>

      {!showAlt1 && (
        <button
          onClick={() => setShowAlt1(true)}
          style={{
            marginTop: 16,
            background: "none",
            border: "none",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          + Agregar otra fecha
        </button>
      )}

      {showAlt1 && (
        <>
          <h4 style={{ marginTop: 24 }}>Fecha alternativa 1</h4>
          <input
            type="date"
            value={alt1Date}
            onChange={(e) => setAlt1Date(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 8 }}
          />
          <select
            value={alt1Time}
            onChange={(e) => setAlt1Time(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 8 }}
          >
            <option value="">Hora</option>
            <option>08:00</option>
            <option>10:00</option>
            <option>12:00</option>
            <option>14:00</option>
            <option>16:00</option>
            <option>18:00</option>
          </select>

          {!showAlt2 && (
            <button
              onClick={() => setShowAlt2(true)}
              style={{
                marginTop: 16,
                background: "none",
                border: "none",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              + Agregar otra fecha
            </button>
          )}
        </>
      )}

      {showAlt2 && (
        <>
          <h4 style={{ marginTop: 24 }}>Fecha alternativa 2</h4>
          <input
            type="date"
            value={alt2Date}
            onChange={(e) => setAlt2Date(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 8 }}
          />
          <select
            value={alt2Time}
            onChange={(e) => setAlt2Time(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 8 }}
          >
            <option value="">Hora</option>
            <option>08:00</option>
            <option>10:00</option>
            <option>12:00</option>
            <option>14:00</option>
            <option>16:00</option>
            <option>18:00</option>
          </select>
        </>
      )}

      <div style={{ marginTop: 16 }}>
        <label>Número de personas *</label>
        <input
          type="number"
          min={1}
          value={people}
          onChange={(e) => setPeople(Number(e.target.value))}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Teléfono *</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />
      </div>

      {/* SAFE BUTTON ZONE */}
      <div
        style={{
          paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
          marginTop: 32,
        }}
      >
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            background: "#111",
            color: "white",
            border: "none",
            fontSize: 16,
          }}
        >
          Enviar solicitud
        </button>
      </div>
    </div>
  )
}
