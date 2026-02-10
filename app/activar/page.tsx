"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUI } from "@/components/ui/UIContext"
import { Compass, Sparkles, CalendarDays } from "lucide-react"

export default function ActivarFlowPage() {
  const router = useRouter()
  const { setHideNav } = useUI()

  const [step, setStep] = useState(0)
  const [code, setCode] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

  function nextStep() {
    setStep((s) => Math.min(s + 1, 2))
  }

  function handleActivate() {
    if (code.trim().toUpperCase() !== "VIVA-2026") {
      setError("Código inválido.")
      return
    }
    if (!email || !name) {
      setError("Completá tu nombre y email.")
      return
    }
    setError("")
    nextStep()
  }

  return (
    <div style={{ minHeight: "100dvh", position: "relative", overflow: "hidden" }}>
      {/* Background */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "url('/image/image_welcome.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        transform: "scale(1.02)",
        zIndex: 0,
      }} />

      {/* Logo */}
      {step === 0 && (
        <img src="/logo/LogoVivaboxSVG.svg" alt="Vivabox" style={{
          position: "absolute",
          top: "10vh",
          left: "50%",
          transform: "translateX(-50%)",
          width: 110,
          zIndex: 2,
        }} />
      )}

      {/* SLIDER */}
      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        width: "300%",
        minHeight: "100dvh",
        transform: `translateX(-${step * 100}vw)`,
        transition: "transform 0.5s ease",
      }}>
        <div style={slideStyle}><WelcomeCard onNext={nextStep} /></div>
        <div style={slideStyle}><ActivateCard {...{code,setCode,email,setEmail,name,setName,error,setError,onActivate:handleActivate}} /></div>
        <div style={slideStyle}><ActivatedCard onFinish={() => router.push("/mapa")} /></div>
      </div>
    </div>
  )
}

const slideStyle: React.CSSProperties = {
  width: "100vw",
  minHeight: "100dvh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 24px",
  boxSizing: "border-box",
}

function WelcomeCard({ onNext }: { onNext: () => void }) {
  return (
    <div style={cardSoft}>
      <h1 style={h1}>Te hicieron un regalo especial</h1>
      <p style={pMain}>Podés elegir la experiencia que más te guste y vivir un gran momento.</p>
      <p style={pSub}>Activá tu experiencia para empezar.</p>
      <button onClick={onNext} style={btnStyle}>Comenzar</button>
    </div>
  )
}

function ActivateCard(props: any) {
  const { code, setCode, email, setEmail, name, setName, error, setError, onActivate } = props

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.4)",
        padding: "30px 24px 26px",
        borderRadius: 26,
        boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>
        Activemos tu experiencia
      </h2>

      {/* CÓDIGO */}
      <label style={{ fontSize: 16, opacity: 0.85, fontWeight: 600 }}>
        Código Vivabox
      </label>

      <input
        type="text"
        placeholder="XXXX-XXXX"
        value={code}
        onChange={(e) => {
          let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
          if (value.length > 4) value = value.slice(0, 4) + "-" + value.slice(4, 8)
          setCode(value)
          setError("")
        }}
        style={{
          ...inputStyle,
          textAlign: "center",      // 🔥 centra texto escrito
          letterSpacing: 1.5,       // mejora lectura del código
          fontWeight: 500,
          textTransform: "uppercase",
        }}
      />

      <p style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
        Está dentro de tu cajita.
      </p>

      {/* DATOS */}
      <div style={{ marginTop: 26 }}>
        <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>
          Para coordinar tu experiencia
        </p>

        <input
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ ...inputStyle, marginBottom: 10 }}
        />

        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <p style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
          Solo para enviarte los detalles
        </p>
      </div>

      {/* RASSURANCE TEXTE SIMPLE */}
      <div
        style={{
          marginTop: 18,
          fontSize: 14,
          color: "#1E7A3B",
          fontWeight: 600,
        }}
      >
        Tu experiencia ya está incluida
      </div>

      {error && <p style={{ color: "#c0392b", marginTop: 12 }}>{error}</p>}

      {/* CTA */}
      <button onClick={onActivate} style={{ ...btnStyle, marginTop: 26 }}>
        Activar mi regalo
      </button>
    </div>
  )
}

import { Check } from "lucide-react"

function ActivatedCard({ onFinish }: { onFinish: () => void }) {
  return (
    <div style={cardWide}>

      {/* ✅ ICÔNE VALIDATION EN PREMIER */}
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: "50%",
          border: "3px solid #1E7A3B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 26px",
        }}
      >
        <Check size={54} strokeWidth={3} color="#1E7A3B" />
      </div>

      {/* TITRE */}
      <h2 style={{ ...h2, marginBottom: 34 }}>
        Tu regalo está activo
      </h2>

      {/* FLOW */}
      <div style={flowRow}>
        <IconStep icon={<Compass size={40} />} label="Explorás" sub="Todo disponible" />
        <BigArrow />
        <IconStep
          icon={<img src="/logo/LogoVivaboxSVG.svg" alt="Vivabox" style={{ width: 58, height: 58 }} />}
          label="Elegís"
          sub="Una experiencia"
          highlight
        />
        <BigArrow />
        <IconStep icon={<CalendarDays size={40} />} label="Reservás" sub="Y coordinamos" />
      </div>

      <button onClick={onFinish} style={btnStyle}>
        Ver experiencias
      </button>
    </div>
  )
}

/* ================= UI BITS ================= */

function IconStep({
  icon,
  label,
  sub,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  sub: string
  highlight?: boolean
}) {
  return (
    <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
      <div
        style={{
          width: 68,
          height: 68,
          margin: "0 auto 10px",
          borderRadius: 20,
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: highlight
            ? "0 0 0 6px rgba(0,0,0,0.04), 0 10px 26px rgba(0,0,0,0.12)"
            : "0 6px 18px rgba(0,0,0,0.08)",
          animation: highlight ? "pulse 2.4s ease-in-out infinite" : "none",
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 17, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 14, opacity: 0.6 }}>{sub}</div>
    </div>
  )
}

function BigArrow() {
  return (
    <div
      style={{
        fontSize: 40,
        opacity: 0.35,
        flex: "0 0 auto",
        transform: "translateY(-32px)",
      }}
    >
      →
    </div>
  )
}

/* STYLES */
const cardSoft:React.CSSProperties={maxWidth:420,width:"100%",background:"rgba(255,255,255,0.78)",padding:"28px 22px 22px",borderRadius:24,boxShadow:"0 20px 60px rgba(0,0,0,0.08)",textAlign:"center"}
const cardWide:React.CSSProperties={maxWidth:440,width:"100%",background:"rgba(255,255,255,0.88)",padding:"42px 26px 34px",borderRadius:26,boxShadow:"0 25px 60px rgba(0,0,0,0.08)",textAlign:"center"}
const h1={fontSize:28,fontWeight:650,marginBottom:18}
const h2={fontSize:28,fontWeight:700,marginBottom:40}
const pMain={fontSize:17,opacity:0.85,marginBottom:18}
const pSub={fontSize:15,opacity:0.65,marginBottom:32}
const flowRow:React.CSSProperties={display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:40}
const btnStyle={padding:16,borderRadius:14,background:"#111",color:"white",border:"none",fontSize:17,fontWeight:600,width:"100%"}
const inputStyle={marginTop:6,padding:14,borderRadius:12,border:"1px solid #ddd",fontSize:16,width:"100%"}
const reassureStyle={marginTop:22,padding:"12px 14px",borderRadius:14,background:"#EAF7EF",fontSize:15,fontWeight:700,color:"#1E7A3B"}
