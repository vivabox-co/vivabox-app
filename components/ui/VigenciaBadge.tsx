"use client"

import { useEffect, useState } from "react"
import { getWhatsAppLink } from "@/lib/constants/contact"
import { getVigenciaInfo, formatVigenciaDate, VigenciaInfo } from "@/lib/utils/vigencia"

type FetchState =
  | { kind: "loading" }
  | { kind: "unavailable" }
  | { kind: "ready"; info: VigenciaInfo }

// Colores reutilizados de patrones ya existentes en la app — no se inventa
// paleta nueva. "urgent" retoma el tono ámbar de la card "Nueva fecha
// propuesta" (seguimiento/[bookingId]/page.tsx); "expired" retoma el rojo ya
// usado para el badge "Cancelada" (ExperienceSummaryCard).
const PALETTE: Record<VigenciaInfo["status"], { bg: string; border: string; label: string; value: string }> = {
  active: { bg: "#fff", border: "transparent", label: "#9a9a9a", value: "#152F40" },
  urgent: { bg: "#FFF6E9", border: "#F2DFB8", label: "#8A5300", value: "#8A5300" },
  expired: { bg: "#fff", border: "#E7E2DC", label: "#9a9a9a", value: "#B42318" },
}

// Se auto-carga (mismo patrón que el resto de la app: fetch + useState, sin
// librería de caché) para poder insertarse en /mapa y /lista sin duplicar la
// llamada a /api/codigo/context en cada página.
export default function VigenciaBadge({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<FetchState>({ kind: "loading" })

  useEffect(() => {
    let cancelled = false

    fetch("/api/codigo/context", { method: "POST", headers: { "Content-Type": "application/json" } })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data?.success && data.data?.purchaseDate) {
          setState({ kind: "ready", info: getVigenciaInfo(data.data.purchaseDate) })
        } else {
          setState({ kind: "unavailable" })
        }
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "unavailable" })
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (state.kind === "loading") return null

  if (state.kind === "unavailable") {
    return (
      <a
        href={getWhatsAppLink("Hola, quisiera saber hasta cuándo puedo usar mi Vivabox.")}
        target="_blank"
        rel="noreferrer"
        style={{ ...pillStyle(compact, "#fff", "#E7E2DC"), textDecoration: "none" }}
      >
        <span style={labelStyle(compact, "#9a9a9a")}>Vigencia</span>
        <span style={valueStyle(compact, "#152F40")}>Consulta la fecha de vencimiento</span>
      </a>
    )
  }

  const { info } = state
  const colors = PALETTE[info.status]
  const dateLabel = formatVigenciaDate(info.expiresAt)

  return (
    <div style={pillStyle(compact, colors.bg, colors.border)}>
      <span style={labelStyle(compact, colors.label)}>
        {info.status === "urgent" && "⚠️ "}
        Vigencia
      </span>
      <span style={valueStyle(compact, colors.value)}>
        {info.status === "expired" ? `Vencida el ${dateLabel}` : `Hasta el ${dateLabel}`}
      </span>
      {!compact && info.status !== "expired" && (
        <span style={{ fontSize: 12, color: colors.label, marginTop: 2 }}>
          Te quedan <strong>{info.daysRemaining}</strong> día{info.daysRemaining === 1 ? "" : "s"}
        </span>
      )}
    </div>
  )
}

function pillStyle(compact: boolean, bg: string, border: string): React.CSSProperties {
  return {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "flex-start",
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: compact ? 14 : 16,
    padding: compact ? "6px 12px" : "10px 14px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    maxWidth: "100%",
  }
}

function labelStyle(compact: boolean, color: string): React.CSSProperties {
  return {
    fontSize: compact ? 9.5 : 10.5,
    fontWeight: 700,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color,
  }
}

function valueStyle(compact: boolean, color: string): React.CSSProperties {
  return {
    fontSize: compact ? 12.5 : 14,
    fontWeight: 700,
    color,
    whiteSpace: compact ? "nowrap" : "normal",
    overflow: compact ? "hidden" : undefined,
    textOverflow: compact ? "ellipsis" : undefined,
  }
}
