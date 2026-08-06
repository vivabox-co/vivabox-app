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
  const [loading, setLoading] = useState(false) // 👈 pour l'appel API

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

  if (!selectedExperience) return null
  const exp = selectedExperience

  async function handleSubmit() {
    // Validation
    if (!momentBlock && !strictTime) return
    if (selectedDates.length === 0) return

    const finalTime: string[] = strictTime ? strictTime : [momentBlock!]
    setSelectedTime(finalTime)

    // Récupérer le token de session et le code (stocké lors de l'activation)
    const token = sessionStorage.getItem("vb_session")
    if (!token) {
      router.replace("/activar")
      return
    }

    // Récupérer le code : on suppose qu'il a été stocké dans sessionStorage
    // lors de l'activation (à implémenter dans la page d'activation)
    const codigo = sessionStorage.getItem("vb_codigo")
    if (!codigo) {
      console.error("Code non trouvé en session")
      router.replace("/activar")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          codigo,
          experienciaId: exp.id,
          fechaDeseada: selectedDates[0], // première date sélectionnée
          cantidadPersonas: people,
          mensaje: `Horario: ${finalTime[0]}`
        })
      })

      const data = await response.json()

      if (data.success && data.bookingId) {
        // Rediriger vers la page de suivi
        router.push(`/reservar/seguimiento/${data.bookingId}`)
      } else {
        console.error("Erreur création booking:", data.error)
        alert("No se pudo crear la reserva. Por favor, intenta de nuevo.")
        setLoading(false)
      }
    } catch (error) {
      console.error("Network error:", error)
      alert("Error de conexión. Intenta de nuevo.")
      setLoading(false)
    }
  }

  return (
    <>
      <div style={pageWrap}>

        {/* 🔥 HERO IMMERSION */}
        <div style={heroWrapper}>
          <img src={exp.image || "/images/placeholder.jpg"} style={heroImage} />
          <div style={heroGradient} />
          <div style={heroTitle}>{exp.title}</div>
        </div>

        <p style={subtitle}>
          Elige fechas. <strong>Nosotros coordinamos.</strong>
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
          </div>
        </Card>

        <Card icon={<Users size={20} />} title="Personas">
          <Chips options={[1, 2, 3, 4, 5]} selected={people} onSelect={setPeople} />
        </Card>

        <button onClick={handleSubmit} disabled={loading} style={{
          ...cta,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? "not-allowed" : "pointer"
        }}>
          {loading ? "Creando reserva..." : "Continuar"}
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

/* ---------- UI ---------- */

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

/* ---------- STYLES ---------- */

const pageWrap: React.CSSProperties = { paddingBottom: 120 }

const heroWrapper: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "40vh",
  overflow: "hidden",
}

const heroImage: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
}

const heroGradient: React.CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "55%",
  background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
}

const heroTitle: React.CSSProperties = {
  position: "absolute",
  bottom: 18,
  left: 20,
  right: 20,
  color: "white",
  fontSize: 22,
  fontWeight: 700,
  lineHeight: 1.2,
}

const subtitle: React.CSSProperties = { padding: 18, color: "#666" }

const card: React.CSSProperties = {
  margin: "0 18px 18px 18px",
  padding: 18,
  borderRadius: 18,
  background: "#F7F5F2",
}

const cardHeader: React.CSSProperties = { display: "flex", gap: 8, alignItems: "center", fontWeight: 600, marginBottom: 12 }

const chipsRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" }

const dateField: React.CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: "#fff",
  border: "1px solid #ddd",
  textAlign: "center",
  fontWeight: 600,
  cursor: "pointer",
}

const timeRow: React.CSSProperties = { marginTop: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }
const orLabel: React.CSSProperties = { fontSize: 16, opacity: 0.5 }

const timeOutlineBtn: React.CSSProperties = { padding: "10px 16px", borderRadius: 999, border: "2px solid #111", background: "#fff", color: "#111" }
const timeFilledBtn: React.CSSProperties = { ...timeOutlineBtn, background: "#111", color: "#fff" }

const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: "10px 14px",
  borderRadius: 999,
  border: active ? "2px solid #111" : "1px solid #ddd",
  background: active ? "#111" : "#fff",
  color: active ? "#fff" : "#333",
})

const cta: React.CSSProperties = {
  margin: "24px 18px 0 18px",
  width: "calc(100% - 36px)",
  padding: 16,
  borderRadius: 14,
  background: "#111",
  color: "#fff",
  fontSize: 16,
  fontWeight: 600,
  border: "none",
}