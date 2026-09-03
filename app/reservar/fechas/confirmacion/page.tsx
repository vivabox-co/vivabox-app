"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Check, MessageCircle } from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import { useUI } from "@/components/ui/UIContext"
import PhoneNumberField from "@/components/ui/PhoneNumberField"
import { LEGAL_PRIVACY_PATH } from "@/lib/constants/legal"

function ConfirmacionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setHideNav, selectedExperience } = useUI()
  const bookingId = searchParams.get("bookingId")
  const [bookedImage, setBookedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Consentimiento WhatsApp/SMS opcional, pedido acá (justo después de que
  // la reserva ya quedó confirmada) en vez de en /confirmar — no es parte
  // del flujo de reserva en sí, así que no debe frenarlo ni compartir el
  // campo de WhatsApp usado ahí para coordinar la fecha con el lugar.
  const [phone, setPhone] = useState("")
  const [phoneValid, setPhoneValid] = useState(false)
  const [consent, setConsent] = useState(false)
  const [consentDismissed, setConsentDismissed] = useState(false)
  const [savingConsent, setSavingConsent] = useState(false)
  const [consentError, setConsentError] = useState("")

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [setHideNav])

  useEffect(() => {
    if (!bookingId) {
      router.replace("/mapa")
      return
    }
    localStorage.setItem("currentBooking", JSON.stringify({ id: bookingId }))

    // La photo de l'expérience vient de selectedExperience (état mémoire, pas
    // fiable après un refresh), donc on la reconfirme via le snapshot renvoyé
    // par la réservation elle-même — la vraie source de vérité. La session
    // vit dans le cookie vb_session, envoyé automatiquement.
    fetch(`/api/booking/${bookingId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.experienceSnapshot?.image) {
          setBookedImage(data.data.experienceSnapshot.image)
        }
      })
      .catch(() => {})
  }, [bookingId, router])

  if (!bookingId) return null

  const heroImage = bookedImage || selectedExperience?.image || "/image/image_welcome.webp"

  async function handleSaveConsent() {
    if (!phoneValid || !consent || savingConsent) return
    setSavingConsent(true)
    setConsentError("")

    try {
      const res = await fetch("/api/beneficiary/marketing-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, consent: true }),
      })
      const data = await res.json()
      if (data.success) {
        setConsentDismissed(true)
      } else {
        setConsentError("No pudimos guardar tu número. Intenta de nuevo.")
        setSavingConsent(false)
      }
    } catch {
      setConsentError("Error de conexión. Intenta de nuevo.")
      setSavingConsent(false)
    }
  }

  return (
    <div style={wrapperStyle}>
      <div
        style={{
          ...bgImage,
          backgroundImage: `url(${heroImage})`,
        }}
      />
      <div style={bgOverlay} />

      <div style={contentStyle}>
        <div style={stackStyle}>
          <div style={cardWide}>
            <div style={checkCircle}>
              <Check size={54} strokeWidth={3} color="#1E7A3B" />
            </div>

            <h2 style={h2}>Listo, ya está en marcha</h2>

            <p style={text}>
              <strong>Ya lo estamos coordinando con el lugar.</strong><br />
              Solo prepárate para disfrutar.
            </p>

            <button
              onClick={() => {
                if (loading) return
                setLoading(true)
                router.push(`/reservar/seguimiento/${bookingId}`)
              }}
              className="vb-btn-primary"
              style={btnStyle}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="vb-spinner-light" />
                  Cargando...
                </>
              ) : (
                "Ver seguimiento"
              )}
            </button>
          </div>

          {!consentDismissed && (
            <div style={consentCard}>
              <h3 style={consentTitle}>
                <MessageCircle size={16} style={consentTitleIcon} />
                ¿Te avisamos de novedades?
              </h3>
              <p style={consentText}>
                Te enviamos novedades y beneficios de Vivabox por WhatsApp o
                SMS. Puedes darte de baja cuando quieras.
              </p>

              <PhoneNumberField
                onChange={(e164, valid) => {
                  setPhone(e164)
                  setPhoneValid(valid)
                }}
              />

              <label style={consentLabel}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  style={consentCheckbox}
                />
                <span>
                  Acepto recibir novedades de Vivabox por WhatsApp y SMS. Más
                  información en nuestra{" "}
                  <a href={LEGAL_PRIVACY_PATH} target="_blank" rel="noreferrer" style={consentLink}>
                    Política de Tratamiento de Datos
                  </a>
                  .
                </span>
              </label>

              {consentError && <p style={consentErrorText}>{consentError}</p>}

              <div style={consentActions}>
                <button
                  onClick={() => setConsentDismissed(true)}
                  style={skipBtn}
                  disabled={savingConsent}
                >
                  Ahora no
                </button>
                <button
                  onClick={handleSaveConsent}
                  style={{
                    ...saveConsentBtn,
                    opacity: phoneValid && consent && !savingConsent ? 1 : 0.5,
                    cursor: phoneValid && consent && !savingConsent ? "pointer" : "not-allowed",
                  }}
                  disabled={!phoneValid || !consent || savingConsent}
                >
                  {savingConsent ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmacionContent />
    </Suspense>
  )
}

/* ================= STYLES ================= */

const wrapperStyle: React.CSSProperties = {
  minHeight: "100dvh",
  position: "relative",
  overflow: "hidden",
}

const bgImage: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundSize: "cover",
  backgroundPosition: "center",
  transform: "scale(1.05)",
  zIndex: 0,
}

const bgOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backdropFilter: "blur(6px)",
  background: "rgba(255,255,255,0.25)",
  zIndex: 1,
}

const contentStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100dvh",
  padding: "32px 24px",
}

const stackStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  width: "100%",
  maxWidth: 440,
}

const cardWide: React.CSSProperties = {
  maxWidth: 440,
  width: "100%",
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.4)",
  padding: "42px 26px 34px",
  borderRadius: 26,
  boxShadow: "0 25px 60px rgba(0,0,0,0.08)",
  textAlign: "center",
}

const consentCard: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.4)",
  padding: "22px 22px 20px",
  borderRadius: 22,
  boxShadow: "0 20px 50px rgba(0,0,0,0.07)",
  textAlign: "left",
  boxSizing: "border-box",
}

const consentTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  fontSize: 16,
  fontWeight: 700,
  color: "#152F40",
  margin: "0 0 6px",
}

const consentTitleIcon: React.CSSProperties = { color: "#999", flexShrink: 0 }

const consentText: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 13,
  color: "#666",
  lineHeight: 1.45,
}

const consentLabel: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  marginTop: 12,
  fontSize: 12.5,
  color: "#666",
  lineHeight: 1.45,
  cursor: "pointer",
}

const consentCheckbox: React.CSSProperties = {
  marginTop: 2,
  width: 16,
  height: 16,
  flexShrink: 0,
  accentColor: "#152F40",
  cursor: "pointer",
}

const consentLink: React.CSSProperties = {
  color: "#152F40",
  fontWeight: 600,
  textDecoration: "underline",
}

const consentErrorText: React.CSSProperties = {
  margin: "10px 0 0",
  color: "#B42318",
  fontSize: 12.5,
}

const consentActions: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 16,
  marginTop: 16,
}

const skipBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#888",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  padding: 0,
}

const saveConsentBtn: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: 999,
  border: "none",
  background: "#152F40",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
}

const checkCircle: React.CSSProperties = {
  width: 110,
  height: 110,
  borderRadius: "50%",
  border: "3px solid #1E7A3B",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 26px",
}

const h2: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 16,
}

const text: React.CSSProperties = {
  fontSize: 16,
  opacity: 0.7,
  lineHeight: 1.5,
  marginBottom: 34,
}

const btnStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px 20px",
  borderRadius: 14,
  background: "#152F40",
  color: "white",
  border: "none",
  fontSize: 17,
  fontWeight: 600,
  boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
}
