"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUI } from "@/components/ui/UIContext"
import { prefersReducedMotion } from "@/lib/utils/prefersReducedMotion"
import { useNextCardMinHeight } from "@/components/ui/useNextCardMinHeight"
import { ActivatedCard } from "@/app/activacion-completa/page"

// Un peu plus douce pour le dernier saut (vers "Tu regalo está activo"),
// comme pour les autres transitions de ce flow (voir app/activar/page.tsx).
const CARD_TRANSITION_MS = 600

export default function DatosPage() {
  const router = useRouter()
  const { setHideNav } = useUI()

  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [codigo, setCodigo] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const { ref: nextCardRef, minHeight: nextCardMinHeight } = useNextCardMinHeight(leaving)

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

  const goToActivacionCompleta = () => {
    if (prefersReducedMotion()) {
      router.push("/activacion-completa")
      return
    }

    setLeaving(true)
    setTimeout(() => router.push("/activacion-completa"), CARD_TRANSITION_MS)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!codigo.trim() || !nombre.trim() || !email.trim()) {
      setError("Completa todos los datos")
      return
    }

    setLoading(true)
    setError("")

    try {
      // 1. Appeler activate_code (première activation ou vérification)
      const activateRes = await fetch("/api/activate_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo, nombre, email }),
      })

      let activateData: any = null
      try {
        activateData = await activateRes.json()
      } catch (parseError) {
        console.error("JSON PARSE ERROR:", parseError)
        setError("Error inesperado del servidor")
        setLoading(false)
        return
      }

      console.log("=== ACTIVATE RES FULL ===", activateRes.status, activateRes.statusText)
console.log("activateData received:", activateData)
console.log("activateData.success:", activateData?.success)
console.log("activateData.data?.token:", activateData?.data?.token)
console.log("activateData.error:", activateData?.error)

      // Cas 1 : première activation réussie avec token
      if (activateData?.success && activateData?.data?.token) {
        sessionStorage.setItem("vb_session", activateData.data.token)
        sessionStorage.setItem("vb_codigo", activateData.data.codigo ?? codigo)
        goToActivacionCompleta()
        return
      }

      // Cas 2 : code déjà activé -> on tente verify_access
      if (activateData?.error === "ALREADY_ACTIVATED") {
        const verifyRes = await fetch("/api/verify_access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codigo, email }),
        })
        let verifyData: any = null
        try {
          verifyData = await verifyRes.json()
        } catch (parseError) {
          console.error("JSON PARSE ERROR:", parseError)
          setError("Error inesperado del servidor")
          setLoading(false)
          return
        }
        if (verifyData?.success && verifyData?.data?.token) {
          sessionStorage.setItem("vb_session", verifyData.data.token)
          sessionStorage.setItem("vb_codigo", verifyData.data.codigo ?? codigo)
          goToActivacionCompleta()
          return
        } else {
          const errorCode = verifyData?.error || "ACCESS_DENIED"
          setError(mapError(errorCode))
          setLoading(false)
          return
        }
      }

      // Cas 3 : autre erreur
      const errorCode = activateData?.error || "UNKNOWN"
      setError(mapError(errorCode))
      setLoading(false)

    } catch (err) {
      console.error("NETWORK ERROR:", err)
      setError("Error de conexión, intenta de nuevo")
      setLoading(false)
    }
  }

  return (
    <div style={container}>

      {/* BACKGROUND */}
      <div style={bgImage} />
      <div style={bgOverlay} />

      {/* CONTENT */}
      <div style={centerWrap}>
        {/* L'écran suivant ("Tu regalo está activo", app/activacion-completa/page.tsx)
            n'a pas de logo au-dessus de sa carte — celui-ci est déjà présent à
            l'intérieur (icône "Elegís"). On le fait donc disparaître en fondu, en
            même temps que glisse la carte, pour qu'il ait déjà totalement disparu
            (opacité + espace) au moment où la navigation vers cette page suivante
            se produit. Sans ça, il reste affiché jusqu'au bout puis disparaît d'un
            coup au changement de page, ce qui fait "sauter" la carte vers le haut. */}
        <img
          src="/logo/LogoVivaboxSVG.svg"
          alt="Vivabox"
          style={{ ...logo, ...(leaving ? logoLeaving : {}) }}
        />

        <div
          style={{
            "--vb-activation-duration": `${CARD_TRANSITION_MS}ms`,
            minHeight: nextCardMinHeight ? `${nextCardMinHeight}px` : undefined,
          } as React.CSSProperties}
          className="vb-activation-viewport"
        >
          {/* Carte actuelle : reste en flux normal (donne sa hauteur au
              viewport) et glisse en entier vers la gauche à la sortie. */}
          <div
            className="vb-activation-card-current"
            style={{
              transform: leaving ? "translateX(-100%)" : "translateX(0)",
              opacity: leaving ? 0.92 : 1,
            }}
          >
            <DatosCardBody
              codigo={codigo}
              nombre={nombre}
              email={email}
              error={error}
              loading={loading}
              disabled={leaving}
              onCodigoChange={(value) => setCodigo(formatCode(value))}
              onNombreChange={setNombre}
              onEmailChange={setEmail}
              onSubmit={handleSubmit}
            />
          </div>

          {/* Carte suivante : montée déjà entièrement construite (aperçu
              statique de l'écran "Tu regalo está activo", non interactif)
              et glisse depuis la droite en même temps que l'autre sort.
              ref mesuré par useNextCardMinHeight pour agrandir le viewport
              si elle est plus haute que la carte actuelle. */}
          {leaving && (
            <div className="vb-activation-card-next" ref={nextCardRef} aria-hidden="true">
              <ActivatedCard onFinish={() => {}} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ============================= */
/* CARTE (contenu) — exportée : réutilisée telle quelle par
   app/activar/page.tsx comme aperçu de la carte "suivante" pendant la
   transition État 1 → État 2. */
/* ============================= */

type DatosCardBodyProps = {
  codigo: string
  nombre: string
  email: string
  error: string
  loading: boolean
  disabled?: boolean
  onCodigoChange: (value: string) => void
  onNombreChange: (value: string) => void
  onEmailChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function DatosCardBody({
  codigo,
  nombre,
  email,
  error,
  loading,
  disabled,
  onCodigoChange,
  onNombreChange,
  onEmailChange,
  onSubmit,
}: DatosCardBodyProps) {
  return (
    <div style={cardSoft}>

      <h1 style={h1}>Activemos tu experiencia</h1>

      <form onSubmit={onSubmit}>

        {/* CODE */}
        <div style={section}>
          <p style={label}>Código Vivabox</p>

          <input
            value={codigo}
            onChange={(e) => onCodigoChange(e.target.value)}
            placeholder="VIVA-XXXX-XXXX"
            style={inputCode}
          />

          <p style={helper}>Está dentro de tu cajita</p>
        </div>

        {/* DATOS */}
        <div style={section}>
          <p style={labelStrong}>Para coordinar tu experiencia</p>

          <input
            value={nombre}
            onChange={(e) => onNombreChange(e.target.value)}
            placeholder="Tu nombre"
            style={input}
          />

          <input
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Tu email"
            type="email"
            style={input}
          />

          <p style={helper}>Solo para enviarte los detalles</p>
        </div>

        {/* REASSURANCE */}
        <p style={included}>Tu experiencia ya está incluida</p>

        {error && <p style={errorText}>{error}</p>}

        <button type="submit" style={btnStyle} disabled={loading || disabled}>
          {loading ? "Activando..." : "Activar mi regalo"}
        </button>

      </form>

    </div>
  )
}

/* ============================= */
/* HELPERS */
/* ============================= */

// Format réel généré au checkout (site vitrine, generateActivationCode.ts) :
// "VIVA" + 8 caractères — affiché ici en "VIVA-XXXX-XXXX" (juste pour la
// lisibilité ; normalizeCode() enlève les tirets avant la comparaison).
function formatCode(value: string) {
  let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "")

  if (!cleaned.startsWith("VIVA")) {
    cleaned = "VIVA" + cleaned.replace(/^VIVA/, "")
  }

  const rest = cleaned.slice(4, 12)
  const parts = rest.match(/.{1,4}/g) || []

  return parts.length ? "VIVA-" + parts.join("-") : "VIVA"
}

function mapError(code: string) {
  switch (code) {
    case "INVALID":
      return "Este código no es válido"
    case "EXPIRED":
      return "Este código ya expiró"
    case "NOT_AVAILABLE":
      return "Este código no está disponible"
    case "ALREADY_ACTIVATED":
      return "Este código ya fue activado"
    case "INVALID_EMAIL":
      return "Email inválido"
    case "INVALID_INPUT":
      return "Completa todos los datos"
    case "INCONSISTENT_STATE":
      return "Hubo un problema con el código. Escríbenos."
    case "EMAIL_MISMATCH":
      return "El email no coincide con el beneficiario registrado"
    case "NOT_ACTIVATED":
      return "El código no está activado"
    default:
      return "No pudimos activar tu regalo"
  }
}

/* ============================= */
/* STYLES */
/* ============================= */

const container: React.CSSProperties = {
  minHeight: "100dvh",
  position: "relative",
  overflow: "hidden",
}

const bgImage: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage: "url('/image/image_welcome.webp')",
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

const logo: React.CSSProperties = {
  width: 100,
  height: "auto",
  display: "block",
  maxHeight: 90,
  marginBottom: 24,
  opacity: 1,
  overflow: "hidden",
  transition: `opacity ${CARD_TRANSITION_MS}ms ease, max-height ${CARD_TRANSITION_MS}ms cubic-bezier(0.16, 1, 0.3, 1), margin-bottom ${CARD_TRANSITION_MS}ms ease`,
}

// Voir commentaire au-dessus de la balise <img> : fondu + réduction de
// l'espace occupé, synchronisés avec la durée du slide de carte, pour que
// le logo ait totalement disparu (visuellement et en place) avant la
// navigation vers l'écran suivant (qui n'a pas ce logo).
const logoLeaving: React.CSSProperties = {
  opacity: 0,
  maxHeight: 0,
  marginBottom: 0,
}

const centerWrap: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 0,
  padding: "32px 24px",
  paddingBottom: "12vh",
  boxSizing: "border-box",
}

const cardSoft: React.CSSProperties = {
  maxWidth: 420,
  width: "100%",
  margin: "0 auto",
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(14px)",
  padding: "16px 24px",
  borderRadius: 26,
  boxShadow: "0 30px 80px rgba(0,0,0,0.12)",
  textAlign: "center",
}

const h1 = {
  fontSize: 26,
  fontWeight: 650,
  marginBottom: 12,
}

const section = {
  marginBottom: 10,
}

const label = {
  fontSize: 14,
  opacity: 0.7,
  marginBottom: 6,
}

const labelStrong = {
  fontSize: 15,
  fontWeight: 600,
  marginBottom: 8,
}

const helper = {
  fontSize: 12,
  opacity: 0.6,
  marginTop: 4,
}

const included = {
  fontSize: 14,
  color: "#1f7a3a",
  marginBottom: 10,
  fontWeight: 500,
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  marginBottom: 8,
  borderRadius: 12,
  border: "1px solid #ddd",
  fontSize: 15,
}

const inputCode: React.CSSProperties = {
  ...input,
  textAlign: "center",
  letterSpacing: "2px",
  fontWeight: 600,
}

const errorText = {
  color: "red",
  fontSize: 13,
  marginBottom: 12,
}

const btnStyle: React.CSSProperties = {
  height: 54,
  borderRadius: 16,
  background: "#111",
  color: "white",
  border: "none",
  fontSize: 16,
  fontWeight: 600,
  width: "100%",
}