"use client"

import { Suspense, useEffect, useLayoutEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUI } from "@/components/ui/UIContext"
import { Compass, CalendarDays, ChevronRight } from "lucide-react"

export default function ActivacionCompletaPage() {
  return (
    <Suspense fallback={null}>
      <ActivacionCompletaContent />
    </Suspense>
  )
}

function ActivacionCompletaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setHideNav } = useUI()

  // false pour que le 1er rendu client corresponde au SSR (pas de mismatch
  // d'hydratation). useLayoutEffect bascule ensuite AVANT la peinture du
  // navigateur si l'aperçu (vb-activation-card-next dans /activar/datos) a
  // déjà joué l'animation du check, pour éviter qu'elle se rejoue ici.
  const [instantCheck, setInstantCheck] = useState(false)

  useLayoutEffect(() => {
    if (sessionStorage.getItem("vb_check_preview_played")) {
      sessionStorage.removeItem("vb_check_preview_played")
      setInstantCheck(true)
    }
  }, [])

  useEffect(() => {
    setHideNav(true)

    const sessionToken = sessionStorage.getItem("vb_session")
    if (!sessionToken) {
      router.replace("/activar")
      return
    }

    // 🔐 Stocker le code s'il est présent dans l'URL (ex: ?codigo=XXX)
    const codigoFromUrl = searchParams.get("codigo")
    if (codigoFromUrl) {
      sessionStorage.setItem("vb_codigo", codigoFromUrl)
    }

    // Optionnel : vérifier que le code est bien présent
    const storedCode = sessionStorage.getItem("vb_codigo")
    if (!storedCode && !codigoFromUrl) {
      console.warn("⚠️ Aucun code trouvé en session – certaines fonctionnalités pourraient échouer")
    }

    return () => setHideNav(false)
  }, [router, searchParams, setHideNav])

  const handleContinue = () => {
    // Navigation "dure" et non un router.push : le Router Cache du client
    // peut avoir mis en cache une redirection vers /activar depuis une
    // visite précédente de /mapa (avant activation, ou session expirée) —
    // il ignore que le cookie de session vient de changer via ce fetch()
    // (pas une Server Action), donc router.push rejouerait ce résultat
    // périmé sans même repasser par le serveur/middleware.
    window.location.href = "/mapa"
  }

  return (
    <div style={container}>
      {/* BACKGROUND */}
      <div style={bgImage} />
      <div style={bgOverlay} />

      {/* CONTENT */}
      <div style={centerWrap}>
        <ActivatedCard onFinish={handleContinue} instant={instantCheck} />
      </div>
    </div>
  )
}

/* ============================= */
/* CARD PRINCIPAL (inchangé) */
/* ============================= */

// Exportée : réutilisée telle quelle par app/activar/datos/page.tsx comme
// carte "suivante" pendant la transition glissée État 2 → État 3 (voir
// ACTIVATION FLOW dans globals.css). Ce composant reste 100% statique
// (aucune prop dépendante de données) donc l'aperçu affiché pendant le
// slide est toujours identique au rendu réel de cette page.
export function ActivatedCard({
  onFinish,
  instant = false,
}: {
  onFinish: () => void
  instant?: boolean
}) {
  // La navigation déclenchée par onFinish (window.location.href, voir
  // handleContinue plus haut) est une vraie navigation dure : elle prend
  // un instant à démarrer, sans rien à afficher tant qu'elle ne le fait
  // pas. Sans ce state, les beta users cliquaient plusieurs fois faute de
  // retour visuel pendant ce délai.
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    if (loading) return
    setLoading(true)
    onFinish()
  }

  return (
    <div style={cardWide}>
      <div style={checkCircle} className={instant ? undefined : "vb-activation-check"}>
        <AnimatedCheck instant={instant} />
      </div>
      <h2 style={h2}>Tu regalo está activo</h2>
      <div style={flowRow}>
        <IconStep icon={<Compass size={40} />} label="Explorás" sub="Todo disponible" />
        <BigArrow />
        <IconStep
          icon={<img src="/logo/LogoVivaboxSVG.svg" style={{ width: 51 }} alt="Vivabox" />}
          label="Elegís"
          sub="Una experiencia"
          highlight
        />
        <BigArrow />
        <IconStep icon={<CalendarDays size={40} />} label="Reservás" sub="Y coordinamos" />
      </div>
      <button
        onClick={handleClick}
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
          "Ver experiencias"
        )}
      </button>
    </div>
  )
}

/* ============================= */
/* SUB COMPONENTS (inchangés) */
/* ============================= */

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
    <div style={stepWrap}>
      <div style={{
        ...stepIcon,
        ...(highlight ? stepHighlight : {})
      }}>
        {icon}
      </div>
      <div style={stepLabel}>{label}</div>
      <div style={stepSub}>{sub}</div>
    </div>
  )
}

// Même tracé que l'icône Check de lucide-react, mais rendu en local pour
// pouvoir animer le <path> (stroke-dash / pathLength) via .vb-activation-checkmark
// dans globals.css — lucide-react ne permet pas d'y accéder directement.
function AnimatedCheck({ instant = false }: { instant?: boolean }) {
  return (
    <svg
      width={54}
      height={54}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1E7A3B"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={instant ? undefined : "vb-activation-checkmark"}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" pathLength={1} />
    </svg>
  )
}

function BigArrow() {
  return (
    <div style={arrow}>
      <ChevronRight size={42} strokeWidth={2.5} />
    </div>
  )
}

/* ============================= */
/* STYLES (inchangés) */
/* ============================= */

const container = {
  minHeight: "100dvh",
  position: "relative" as const,
  overflow: "hidden",
}

const bgImage = {
  position: "absolute" as const,
  inset: 0,
  backgroundImage: "url('/image/image_welcome.webp')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  transform: "scale(1.05)",
}

const bgOverlay = {
  position: "absolute" as const,
  inset: 0,
  backdropFilter: "blur(6px)",
  background: "rgba(255,255,255,0.25)",
}

const centerWrap = {
  position: "relative" as const,
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  gap: "24px",
  padding: "32px 24px",
  paddingBottom: "12vh",
}

const cardWide = {
  maxWidth: 520,
  width: "100%",
  margin: "0 auto",
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(14px)",
  padding: "32px 24px",
  borderRadius: 26,
  boxShadow: "0 30px 80px rgba(0,0,0,0.12)",
  textAlign: "center" as const,
}

const checkCircle = {
  width: 110,
  height: 110,
  borderRadius: "50%",
  border: "3px solid #1E7A3B",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 26px",
}

const h2 = {
  fontSize: 26,
  fontWeight: 650,
  marginBottom: 30,
}

const flowRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 30,
}

const stepWrap = {
  flex: 1,
  minWidth: 0,
  textAlign: "center" as const,
}

const stepIcon = {
  width: 68,
  height: 68,
  margin: "0 auto 10px",
  borderRadius: 20,
  background: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
}

const stepHighlight = {
  boxShadow: "0 0 0 6px rgba(0,0,0,0.04), 0 10px 26px rgba(0,0,0,0.12)",
}

const stepLabel = {
  fontSize: 16,
  fontWeight: 700,
}

const stepSub = {
  fontSize: 13,
  opacity: 0.6,
}

const arrow = {
  opacity: 0.35,
  transform: "translateY(-20px)",
}

const btnStyle = {
  height: 54,
  borderRadius: 16,
  background: "#111",
  color: "white",
  border: "none",
  fontSize: 16,
  fontWeight: 600,
  width: "100%",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
}