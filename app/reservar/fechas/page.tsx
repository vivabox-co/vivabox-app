"use client"

import { useState, useEffect } from "react"
import { useUI } from "@/components/ui/UIContext"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Users, Sunrise, Sun, Sunset } from "lucide-react"
import DatePickerModal from "@/components/ui/DatePickerModal"
import TimePickerModal from "@/components/ui/TimePickerModal"

type Moment = "morning" | "afternoon" | "night" | null

export default function FechasPage() {
  const { selectedExperience, setSelectedDate, setSelectedTime, setHideNav } = useUI()
  const router = useRouter()

  const [date, setDate] = useState<string | null>(null)
  const [altDate, setAltDate] = useState<string | null>(null)
  const [openCalendar, setOpenCalendar] = useState<"main" | "alt" | null>(null)

  const [momentBlock, setMomentBlock] = useState<Moment>(null)
  const [strictTime, setStrictTime] = useState<string | null>(null)

  const [people, setPeople] = useState(2)
  const [openTimePicker, setOpenTimePicker] = useState(false)

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

  if (!selectedExperience) return null
  const exp = selectedExperience

  function handleSubmit() {
    if (!date) return alert("Elegí un día")
    if (!momentBlock && !strictTime) return alert("Elegí un momento o una hora")

    const finalTime = strictTime ? strictTime : momentBlock!

    setSelectedDate(date)
    setSelectedTime(finalTime)

    router.push("/reservar/fechas/confirmacion")
  }

  return (
    <>
      <div style={{ padding: 18, paddingBottom: 120 }}>
        <img src={exp.image} style={{ width: "100%", borderRadius: 22 }} />
        <h2 style={{ marginTop: 18 }}>{exp.title}</h2>

        <p style={{ color: "#666", marginTop: 6 }}>
          Elegí cuándo vivirla. <strong>Nosotros coordinamos.</strong>
        </p>

        {/* DÍA */}
        <Card icon={<Calendar size={20} />} title="Día">
          <DateField value={date} onClick={() => setOpenCalendar("main")} />
        </Card>

        {/* OTRA OPCIÓN */}
        <Card icon={<Calendar size={20} />} title="Otra opción">
          <DateField value={altDate} onClick={() => setOpenCalendar("alt")} />
        </Card>

        {/* MOMENTO */}
        <Card icon={<Clock size={20} />} title="Momento del día">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <MomentChip icon={<Sunrise size={16} />} label="Mañana" value="morning" {...{ momentBlock, setMomentBlock, setStrictTime }} />
            <MomentChip icon={<Sun size={16} />} label="Tarde" value="afternoon" {...{ momentBlock, setMomentBlock, setStrictTime }} />
            <MomentChip icon={<Sunset size={16} />} label="Noche" value="night" {...{ momentBlock, setMomentBlock, setStrictTime }} />
          </div>

          <div style={{ marginTop: 14 }}>
            <button onClick={() => setOpenTimePicker(true)} style={timeBtn}>
              Elegir hora exacta
            </button>

            {strictTime && (
              <div style={{ marginTop: 8, fontSize: 14 }}>
                Hora elegida: <strong>{strictTime}</strong>
              </div>
            )}
          </div>
        </Card>

        {/* PERSONAS */}
        <Card icon={<Users size={20} />} title="Personas">
          <Chips options={[1, 2, 3, 4, 5]} selected={people} onSelect={setPeople} />
          <p style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
            Podemos ayudarte a organizar personas adicionales si lo necesitás.
          </p>
        </Card>

        <button onClick={handleSubmit} style={cta}>
          Reservar experiencia
        </button>

        <p style={sla}>Confirmación en menos de 48h</p>
      </div>

      {/* CALENDARIO */}
      {openCalendar && (
        <DatePickerModal
          onClose={() => setOpenCalendar(null)}
          onSelect={(payload: { date: string }) => {
            openCalendar === "main" ? setDate(payload.date) : setAltDate(payload.date)
            setOpenCalendar(null)
          }}
        />
      )}

      {/* TIME PICKER */}
      {openTimePicker && (
        <TimePickerModal
          onClose={() => setOpenTimePicker(false)}
          onConfirm={(t: string) => {
            setStrictTime(t)
            setMomentBlock(null)
            setOpenTimePicker(false)
          }}
        />
      )}
    </>
  )
}

/* ---------- UI ---------- */

function Card({ icon, title, children }: any) {
  return (
    <div style={card}>
      <div style={cardHeader}>{icon}<span>{title}</span></div>
      {children}
    </div>
  )
}

function DateField({ value, onClick }: any) {
  return <div onClick={onClick} style={dateField}>{value || "Seleccionar fecha"}</div>
}

function Chips({ options, selected, onSelect }: any) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((opt: any) => (
        <button key={opt} onClick={() => onSelect(opt)} style={chipStyle(selected === opt)}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function MomentChip({ icon, label, value, momentBlock, setMomentBlock, setStrictTime }: any) {
  const active = momentBlock === value
  return (
    <button
      onClick={() => {
        setMomentBlock(value)
        setStrictTime(null)
      }}
      style={{ ...chipStyle(active), display: "flex", gap: 6, alignItems: "center" }}
    >
      {icon}
      {label}
    </button>
  )
}

/* ---------- STYLES ---------- */

const chipStyle = (active: boolean) => ({
  padding: "10px 14px",
  borderRadius: 999,
  border: active ? "2px solid #111" : "1px solid #ddd",
  background: active ? "#111" : "#fff",
  color: active ? "#fff" : "#333",
  fontWeight: 500,
  cursor: "pointer"
})

const card = { marginTop: 22, padding: 18, borderRadius: 18, background: "#F7F5F2" }
const cardHeader = { display: "flex", gap: 8, alignItems: "center", fontWeight: 600, marginBottom: 12 }
const dateField = { padding: 16, borderRadius: 16, background: "#fff", border: "1px solid #ddd", textAlign: "center" as const, fontWeight: 600, cursor: "pointer" }
const timeBtn = { padding: "10px 14px", borderRadius: 999, border: "1px solid #ddd", background: "#fff", fontWeight: 500 }
const cta = { marginTop: 30, width: "100%", padding: 16, borderRadius: 14, background: "#111", color: "#fff", fontSize: 16, fontWeight: 600, border: "none" }
const sla = { textAlign: "center" as const, marginTop: 14, fontSize: 13, color: "#666" }
