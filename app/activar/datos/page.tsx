"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUI } from "@/components/ui/UIContext"

export default function DatosPage() {
  const router = useRouter()
  const { setHideNav } = useUI()

  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [codigo, setCodigo] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

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
        router.push("/activacion-completa")
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
          router.push("/activacion-completa")
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
        <img
          src="/logo/LogoVivaboxSVG.svg"
          alt="Vivabox"
          style={logo}
        />
        <div style={cardSoft}>

          <h1 style={h1}>Activemos tu experiencia</h1>

          <form onSubmit={handleSubmit}>

            {/* CODE */}
            <div style={section}>
              <p style={label}>Código Vivabox</p>

              <input
                value={codigo}
                onChange={(e) => setCodigo(formatCode(e.target.value))}
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
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                style={input}
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu email"
                type="email"
                style={input}
              />

              <p style={helper}>Solo para enviarte los detalles</p>
            </div>

            {/* REASSURANCE */}
            <p style={included}>Tu experiencia ya está incluida</p>

            {error && <p style={errorText}>{error}</p>}

            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? "Activando..." : "Activar mi regalo"}
            </button>

          </form>

        </div>
      </div>
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
}

const centerWrap: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "24px",
  padding: "32px 24px",
  paddingBottom: "12vh",
  boxSizing: "border-box",
}

const cardSoft: React.CSSProperties = {
  maxWidth: 420,
  width: "100%",
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(14px)",
  padding: "32px 24px",
  borderRadius: 26,
  boxShadow: "0 30px 80px rgba(0,0,0,0.12)",
  textAlign: "center",
}

const h1 = {
  fontSize: 26,
  fontWeight: 650,
  marginBottom: 20,
}

const section = {
  marginBottom: 20,
}

const label = {
  fontSize: 14,
  opacity: 0.7,
  marginBottom: 8,
}

const labelStrong = {
  fontSize: 15,
  fontWeight: 600,
  marginBottom: 10,
}

const helper = {
  fontSize: 12,
  opacity: 0.6,
  marginTop: 6,
}

const included = {
  fontSize: 14,
  color: "#1f7a3a",
  marginBottom: 16,
  fontWeight: 500,
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  marginBottom: 12,
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