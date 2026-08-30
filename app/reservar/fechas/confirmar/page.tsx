"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react"
import { useUI, usePageReady } from "@/components/ui/UIContext"
import BrandRibbon from "@/components/ui/BrandRibbon"
import ExperienceSummaryCard from "@/components/list/ExperienceSummaryCard"
import { isValidWhatsApp } from "@/lib/utils/isValidWhatsApp"

// Sépare le nom complet stocké côté activation ("Nombre Apellido", un seul
// champ en base — voir activation_codes.beneficiary_name) en deux parties
// pour l'édition via "Cambiar" : le premier mot est le nombre, le reste
// (potentiellement plusieurs mots) est l'apellido. Repli simple, pas un vrai
// parseur de noms composés — cohérent avec la saisie d'origine (deux champs
// distincts concaténés à l'activation, voir app/activar/datos/page.tsx).
function splitName(fullName: string): { nombre: string; apellido: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return { nombre: parts[0] ?? "", apellido: parts.slice(1).join(" ") }
}

export default function ConfirmarReservaPage() {
  const router = useRouter()
  const {
    selectedExperience,
    setHideNav,
    reservationDates,
    reservationExtraPeople,
    clearReservationDraft,
  } = useUI()

  const [beneficiaryName, setBeneficiaryName] = useState("")
  const [loadingName, setLoadingName] = useState(true)

  const [editingName, setEditingName] = useState(false)
  const [nombreEdit, setNombreEdit] = useState("")
  const [apellidoEdit, setApellidoEdit] = useState("")
  const [savingName, setSavingName] = useState(false)

  const [whatsapp, setWhatsapp] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

  useEffect(() => {
    fetch("/api/codigo/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.beneficiaryName) {
          setBeneficiaryName(data.data.beneficiaryName)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingName(false))
  }, [])

  usePageReady(!loadingName)

  // Sans expérience choisie ou sans fechas (arrivée directe sur l'URL, refresh
  // ayant vidé le contexte...), il n'y a rien à confirmer — retour à l'étape
  // qui produit ces données.
  useEffect(() => {
    if (!selectedExperience || reservationDates.length === 0) {
      router.replace("/reservar/fechas")
    }
  }, [selectedExperience, reservationDates, router])

  if (!selectedExperience || reservationDates.length === 0) {
    return null
  }

  const exp = selectedExperience
  const baseCapacity = exp.format === "duo" ? 2 : 1
  const totalPeople = baseCapacity + reservationExtraPeople
  const preferredDate = reservationDates[0]

  const whatsappValid = isValidWhatsApp(whatsapp)
  const isFormComplete = whatsappValid

  function startEditName() {
    const { nombre, apellido } = splitName(beneficiaryName)
    setNombreEdit(nombre)
    setApellidoEdit(apellido)
    setEditingName(true)
  }

  async function saveName() {
    const fullName = `${nombreEdit.trim()} ${apellidoEdit.trim()}`.trim()
    if (!fullName) return

    setSavingName(true)
    try {
      const res = await fetch("/api/beneficiary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: fullName }),
      })
      const data = await res.json()
      if (data.success) {
        setBeneficiaryName(fullName)
        setEditingName(false)
      }
    } catch {
      // Silencieux : la personne reste sur l'édition et peut réessayer.
    } finally {
      setSavingName(false)
    }
  }

  async function handleSubmit() {
    if (!isFormComplete || submitting) return

    setSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienciaId: exp.id,
          fechaDeseada: preferredDate,
          fechasDeseadas: reservationDates,
          cantidadPersonas: totalPeople,
          whatsapp,
        }),
      })

      const data = await response.json()

      if (data.success && data.bookingId) {
        clearReservationDraft()
        router.push(`/reservar/fechas/confirmacion?bookingId=${data.bookingId}`)
      } else {
        setError("No se pudo enviar la solicitud. Por favor, intenta de nuevo.")
        setSubmitting(false)
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
      setSubmitting(false)
    }
  }

  return (
    <div style={pageWrap}>
      <BrandRibbon />

      <button onClick={() => router.push("/reservar/fechas")} style={backLink}>
        <ArrowLeft size={15} strokeWidth={2.5} />
        Fechas y personas
      </button>

      <h1 style={pageTitle}>Confirma tu reserva</h1>

      <div style={{ margin: "16px 20px 0" }}>
        <ExperienceSummaryCard
          title={exp.title}
          subtitle={`${totalPeople} ${totalPeople === 1 ? "persona" : "personas"}`}
          location={exp.zone}
          image={exp.image}
          requestedDates={reservationDates}
          datesHeading="Fechas elegidas"
          category={exp.category}
        />
      </div>

      {/* ---------- RESERVA A NOMBRE DE ---------- */}
      <section style={section}>
        <p style={sectionLabel}>Reserva a nombre de</p>

        {editingName ? (
          <>
            <div style={nameRow}>
              <input
                value={nombreEdit}
                onChange={(e) => setNombreEdit(e.target.value)}
                placeholder="Nombre"
                style={inputHalf}
                autoFocus
              />
              <input
                value={apellidoEdit}
                onChange={(e) => setApellidoEdit(e.target.value)}
                placeholder="Apellido"
                style={inputHalf}
              />
            </div>
            <div style={editActionsRow}>
              <button onClick={() => setEditingName(false)} style={cancelLink} disabled={savingName}>
                Cancelar
              </button>
              <button
                onClick={saveName}
                style={saveBtn}
                disabled={savingName || !nombreEdit.trim() || !apellidoEdit.trim()}
              >
                {savingName ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={nameRowDisplay}>
              <span style={nameValue}>{loadingName ? "..." : beneficiaryName || "—"}</span>
              <button onClick={startEditName} style={inlineTextLink}>
                Cambiar
              </button>
            </div>
            <p style={helperText}>Este será el nombre que enviaremos al lugar.</p>
          </>
        )}
      </section>

      {/* ---------- WHATSAPP ---------- */}
      <section style={section}>
        <h2 style={sectionTitle}>
          <MessageCircle size={17} style={sectionTitleIcon} />
          ¿Dónde te avisamos?
        </h2>

        <label style={fieldLabel}>WhatsApp</label>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+57 300 1234567"
          type="tel"
          inputMode="tel"
          style={input}
        />
        <p style={helperText}>Te avisaremos por aquí cuando el lugar confirme tu fecha.</p>
      </section>

      {error && <p style={errorText}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!isFormComplete || submitting}
        className="vb-btn-primary"
        style={{
          ...cta,
          opacity: submitting ? 0.6 : isFormComplete ? 1 : 0.4,
          cursor: submitting || !isFormComplete ? "not-allowed" : "pointer",
        }}
      >
        {submitting ? (
          <>
            <span className="vb-spinner-light" />
            Enviando...
          </>
        ) : (
          <>
            Enviar solicitud
            <ArrowRight size={16} strokeWidth={2.5} />
          </>
        )}
      </button>
    </div>
  )
}

/* ---------- STYLES ---------- */

const pageWrap: React.CSSProperties = { paddingBottom: 120, background: "#FAF8F5", minHeight: "100dvh" }

const backLink: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  margin: "16px 20px 0",
  padding: 0,
  background: "transparent",
  border: "none",
  color: "#666",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
}

const pageTitle: React.CSSProperties = {
  margin: "14px 20px 0",
  fontSize: 24,
  fontWeight: 700,
  color: "#152F40",
  letterSpacing: -0.3,
  lineHeight: 1.25,
}

const section: React.CSSProperties = {
  margin: "16px 20px 0 20px",
  padding: 20,
  borderRadius: 20,
  border: "1px solid #ECEAE5",
  background: "#fff",
}

const sectionLabel: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: 0.3,
  textTransform: "uppercase",
  color: "#9a9a9a",
}

const sectionTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 19,
  fontWeight: 700,
  color: "#152F40",
  letterSpacing: -0.2,
  margin: "0 0 14px",
}

const sectionTitleIcon: React.CSSProperties = { color: "#999", flexShrink: 0 }

const nameRowDisplay: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
}

const nameValue: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: "#152F40" }

const inlineTextLink: React.CSSProperties = {
  background: "transparent",
  border: "none",
  padding: "6px 0",
  color: "#111",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  flexShrink: 0,
}

const helperText: React.CSSProperties = { margin: "8px 0 0", fontSize: 12.5, color: "#999", lineHeight: 1.4 }

const nameRow: React.CSSProperties = { display: "flex", gap: 10 }

const inputHalf: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  fontSize: 15,
}

const editActionsRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 14,
  marginTop: 12,
  alignItems: "center",
}

const cancelLink: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#888",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
}

const saveBtn: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: 999,
  border: "none",
  background: "#152F40",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
}

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#555",
  marginBottom: 6,
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  fontSize: 15,
  boxSizing: "border-box",
}

const errorText: React.CSSProperties = {
  margin: "16px 20px 0",
  color: "#B42318",
  fontSize: 13,
}

const cta: React.CSSProperties = {
  margin: "28px 20px 0 20px",
  width: "calc(100% - 40px)",
  padding: 16,
  borderRadius: 14,
  background: "#152F40",
  color: "#fff",
  fontSize: 16,
  fontWeight: 600,
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
}
