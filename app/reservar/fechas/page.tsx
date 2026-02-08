"use client"

import { useState, useEffect } from "react"
import { useUI } from "@/components/ui/UIContext"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Users, Phone, MessageSquare } from "lucide-react"

export default function FechasPage() {
  const {
    selectedExperience,
    setSelectedDate,
    setSelectedTime,
    setHideNav,
    setDrawerOpen,
  } = useUI()

  const router = useRouter()

  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [people, setPeople] = useState(1)
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")

  const [altDate, setAltDate] = useState("")
  const [altTime, setAltTime] = useState("")

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [setHideNav])

  if (!selectedExperience) {
    return <div style={{ padding: 20 }}>No hay experiencia seleccionada.</div>
  }

  const exp = selectedExperience

  function handleSubmit() {
    if (!date || !time) {
      alert("Completa fecha y hora")
      return
    }

    if (exp.needsPhone && !phone) {
      alert("Necesitamos tu teléfono")
      return
    }

    if (exp.needsPeopleCount && people < 1) {
      alert("Indica al menos 1 persona")
      return
    }

    setSelectedDate(date)
    setSelectedTime(time)

    const bookingObject = {
      id: Date.now().toString(),
      experienceId: exp.id,
      experienceSnapshot: {
        title: exp.title,
        image: exp.image,
        zone: exp.zone,
        duration: exp.duration,
        providerName: exp.id, // 🔥 id = nombre del presta (según tu sheet)
      },
      date,
      time,
      altDate: altDate || null,
      altTime: altTime || null,
      people: exp.needsPeopleCount ? people : 1,
      phone: exp.needsPhone ? phone : null,
      notes,
      status: "requested",
    }

    localStorage.setItem("currentBooking", JSON.stringify(bookingObject))
    router.push("/reservar/fechas/confirmacion")
  }

  return (
    <div style={{ padding: 16, paddingBottom: 120 }}>
      {/* BACK */}
      <button
        onClick={() => {
          setHideNav(false)
          setDrawerOpen(true)
          router.push("/mapa")
        }}
      >
        ←
      </button>

      {/* HERO */}
      <img
        src={exp.image}
        alt={exp.title}
        style={{ width: "100%", borderRadius: 12 }}
      />
      <h2 style={{ marginTop: 12 }}>{exp.title}</h2>

      <p style={{ marginTop: 8, color: "#555" }}>
        Proponé la fecha que más te convenga. Nosotros coordinamos todo.
      </p>

      {/* FECHA PRINCIPAL */}
      <h3 style={{ marginTop: 28 }}>Fecha principal</h3>

      <Label icon={Calendar} text="Fecha *" />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />

      <Label icon={Clock} text="Hora *" />
      <select value={time} onChange={e => setTime(e.target.value)}>
        <option value="">Seleccionar</option>
        <option>08:00</option>
        <option>10:00</option>
        <option>12:00</option>
        <option>14:00</option>
        <option>16:00</option>
        <option>18:00</option>
      </select>

      {/* ALTERNATIVA */}
      <h3 style={{ marginTop: 28 }}>Fecha alternativa (opcional)</h3>
      <input type="date" value={altDate} onChange={e => setAltDate(e.target.value)} />
      <select value={altTime} onChange={e => setAltTime(e.target.value)}>
        <option value="">Hora alternativa</option>
        <option>08:00</option>
        <option>10:00</option>
        <option>12:00</option>
        <option>14:00</option>
        <option>16:00</option>
        <option>18:00</option>
      </select>

      {/* PERSONAS */}
      {exp.needsPeopleCount && (
        <>
          <Label icon={Users} text="¿Cuántas personas asistirán?" />
          <input
            type="number"
            min={1}
            value={people}
            onChange={e => setPeople(Number(e.target.value))}
          />
        </>
      )}

      {exp.extraPeopleOption?.allowed && (
        <p style={{ marginTop: 10, fontSize: 13, color: "#666" }}>
          {exp.extraPeopleOption.note}
        </p>
      )}

      {/* TELÉFONO */}
      {exp.needsPhone && (
        <>
          <Label icon={Phone} text="Teléfono *" />
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
        </>
      )}

      {/* NOTAS */}
      <Label icon={MessageSquare} text="¿Algo que debamos tener en cuenta?" />
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Alergias, celebración, movilidad reducida..."
      />

      <p style={{ marginTop: 18, fontSize: 13, color: "#666" }}>
        Te confirmaremos la experiencia en menos de 48 horas.
      </p>

      <button
        onClick={handleSubmit}
        style={{
          marginTop: 32,
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
  )
}

/* UI small components */

function Label({ icon: Icon, text }: any) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 14 }}>
      <Icon size={16} />
      <label>{text}</label>
    </div>
  )
}
