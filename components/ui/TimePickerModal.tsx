"use client"
import { useState } from "react"

type Props = {
  onClose: () => void
  onConfirm: (time: string) => void
}

export default function TimePickerModal({ onClose, onConfirm }: Props) {
  const [hour, setHour] = useState(14)
  const [minute, setMinute] = useState(0)

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = [0, 15, 30, 45]

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>

        <div style={header}>Elegí una hora</div>

        <div style={pickerRow}>
          <Wheel values={hours} selected={hour} set={setHour} />
          <div style={colon}>:</div>
          <Wheel values={minutes} selected={minute} set={setMinute} />
        </div>

        <button
          style={confirmBtn}
          onClick={() => {
            const h = String(hour).padStart(2, "0")
            const m = String(minute).padStart(2, "0")
            onConfirm(`${h}:${m}`)
            onClose()
          }}
        >
          Confirmar hora
        </button>
      </div>
    </div>
  )
}

function Wheel({ values, selected, set }: any) {
  return (
    <div style={wheel}>
      {values.map((v: number) => (
        <div
          key={v}
          onClick={() => set(v)}
          style={{
            ...wheelItem,
            opacity: selected === v ? 1 : 0.35,
            fontSize: selected === v ? 28 : 20,
            fontWeight: selected === v ? 700 : 400
          }}
        >
          {String(v).padStart(2, "0")}
        </div>
      ))}
    </div>
  )
}

/* STYLES */
const overlay = { position:"fixed" as const, inset:0, background:"rgba(0,0,0,.35)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:3000 }
const modal = { width:"100%", maxWidth:500, background:"#111", color:"white", borderRadius:"28px 28px 0 0", padding:"26px 20px 40px" }
const header = { textAlign:"center" as const, fontSize:18, fontWeight:600, marginBottom:20 }
const pickerRow = { display:"flex", justifyContent:"center", alignItems:"center", gap:18 }
const colon = { fontSize:30, fontWeight:600 }
const wheel = { height:180, overflow:"auto" as const, textAlign:"center" as const }
const wheelItem = { padding:"6px 0", cursor:"pointer", transition:"all .15s" }
const confirmBtn = { marginTop:28, width:"100%", padding:16, borderRadius:14, border:"none", background:"white", color:"#111", fontWeight:600 }
