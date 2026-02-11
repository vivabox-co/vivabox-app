"use client"

import { useState, useEffect } from "react"
import { useUI } from "@/components/ui/UIContext"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Users, Sunrise, Sun, Sunset } from "lucide-react"
import DatePickerModal from "@/components/ui/DatePickerModal"
import TimePickerModal from "@/components/ui/TimePickerModal"

type Moment = "morning" | "afternoon" | "night" | null

export default function FechasPage() {
  const { selectedExperience, setSelectedTime, setHideNav } = useUI()
  const router = useRouter()

  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [openCalendar, setOpenCalendar] = useState(false)

  const [momentBlock, setMomentBlock] = useState<Moment>(null)
  const [strictTime, setStrictTime] = useState<string[] | null>(null)

  const [people, setPeople] = useState(2)
  const [openTimePicker, setOpenTimePicker] = useState(false)

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

  if (!selectedExperience) return null
  const exp = selectedExperience

  function handleSubmit() {
    if (!momentBlock && !strictTime) return

    const finalTime: string[] = strictTime ? strictTime : [momentBlock!]
    setSelectedTime(finalTime)

    // 🔥 SAUVEGARDE POUR PAGE CONFIRMATION
    localStorage.setItem(
      "selectedExperience",
      JSON.stringify({
        name: exp.title,
        image: exp.image,
      })
    )

    router.push("/reservar/fechas/confirmacion")
  }

  return (
    <>
      <div style={pageWrap}>
        <img src={exp.image} style={heroImg} />
        <h2 style={{ marginTop: 18 }}>{exp.title}</h2>

        <p style={{ color: "#666", marginTop: 6 }}>
          Uno o varios días que te ilusionen. <strong>Nosotros coordinamos.</strong>
        </p>

        <Card icon={<Calendar size={20} />} title="Días">
          <DateField
            value={
              selectedDates.length > 0
                ? selectedDates.map(d => new Date(d).toLocaleDateString("es-CO")).join(" • ")
                : "Elegir días"
            }
            onClick={() => setOpenCalendar(true)}
          />
        </Card>

        <Card icon={<Clock size={20} />} title="Horario">
          <div style={chipsRow}>
            <MomentChip icon={<Sunrise size={16} />} label="Mañana" value="morning" {...{ momentBlock, setMomentBlock, setStrictTime }} />
            <MomentChip icon={<Sun size={16} />} label="Tarde" value="afternoon" {...{ momentBlock, setMomentBlock, setStrictTime }} />
            <MomentChip icon={<Sunset size={16} />} label="Noche" value="night" {...{ momentBlock, setMomentBlock, setStrictTime }} />
          </div>

          <div style={timeRow}>
            <span style={orLabel}>o</span>
            <button onClick={() => setOpenTimePicker(true)} style={strictTime ? timeFilledBtn : timeOutlineBtn}>
              Indicar hora
            </button>
            {strictTime && (
              <div style={timeValueWrap}>
                <span>{strictTime.join(" • ")}</span>
                {strictTime.length === 1 && (
                  <span style={addHint} onClick={() => setOpenTimePicker(true)}>+ puedes añadir otra</span>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card icon={<Users size={20} />} title="Personas">
          <Chips options={[1, 2, 3, 4, 5]} selected={people} onSelect={setPeople} />
        </Card>

        <button onClick={handleSubmit} style={cta}>
          Continuar
        </button>
      </div>

      {openCalendar && (
        <DatePickerModal
          initialDates={selectedDates}
          onClose={() => setOpenCalendar(false)}
          onSelect={(payload) => {
            setSelectedDates(payload.dates)
            setOpenCalendar(false)
          }}
        />
      )}

      {openTimePicker && (
        <TimePickerModal
          onClose={() => setOpenTimePicker(false)}
          onConfirm={(times: string[]) => {
            setStrictTime(times)
            setMomentBlock(null)
            setOpenTimePicker(false)
          }}
        />
      )}
    </>
  )
}

/* ---------- COMPONENTS ---------- */

function Card({ icon, title, children }: any) {
  return <div style={card}><div style={cardHeader}>{icon}<span>{title}</span></div>{children}</div>
}

function DateField({ value, onClick }: any) {
  return <div onClick={onClick} style={dateField}>{value}</div>
}

function Chips({ options, selected, onSelect }: any) {
  return (
    <div style={chipsRow}>
      {options.map((opt: number) => (
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
    <button onClick={() => { setMomentBlock(value); setStrictTime(null) }} style={{ ...chipStyle(active), display: "flex", gap: 6, alignItems: "center" }}>
      {icon}{label}
    </button>
  )
}

/* ---------- STYLES TS SAFE ---------- */

const pageWrap: React.CSSProperties = { padding: 18, paddingBottom: 120 }
const heroImg: React.CSSProperties = { width: "100%", borderRadius: 22 }

const card: React.CSSProperties = { marginTop: 22, padding: 18, borderRadius: 18, background: "#F7F5F2" }
const cardHeader: React.CSSProperties = { display: "flex", gap: 8, alignItems: "center", fontWeight: 600, marginBottom: 12 }

const chipsRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" }

const dateField: React.CSSProperties = { padding: 16, borderRadius: 16, background: "#fff", border: "1px solid #ddd", textAlign: "center", fontWeight: 600, cursor: "pointer" }

const timeRow: React.CSSProperties = { marginTop: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }
const orLabel: React.CSSProperties = { fontSize: 16, opacity: 0.5 }

const timeOutlineBtn: React.CSSProperties = { padding: "10px 16px", borderRadius: 999, border: "2px solid #111", background: "#fff", color: "#111", fontWeight: 500, cursor: "pointer" }
const timeFilledBtn: React.CSSProperties = { ...timeOutlineBtn, background: "#111", color: "#fff" }

const timeValueWrap: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#111" }
const addHint: React.CSSProperties = { fontSize: 12, opacity: 0.5, cursor: "pointer" }

const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: "10px 14px",
  borderRadius: 999,
  border: active ? "2px solid #111" : "1px solid #ddd",
  background: active ? "#111" : "#fff",
  color: active ? "#fff" : "#333",
  fontWeight: 500,
  cursor: "pointer"
})

const cta: React.CSSProperties = { marginTop: 30, width: "100%", padding: 16, borderRadius: 14, background: "#111", color: "#fff", fontSize: 16, fontWeight: 600, border: "none" }
