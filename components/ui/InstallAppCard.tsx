"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { X, Download, Share2 } from "lucide-react"
import VivaboxLogo from "./VivaboxLogo"
import {
  getDeferredInstallPrompt,
  subscribeInstallPrompt,
  clearDeferredInstallPrompt,
} from "@/lib/pwa/deferredInstallPrompt"

// Mémorise "ne plus jamais proposer" pour cet appareil (choix volontairement
// non synchronisé au compte : voir décision produit — un refus sur un
// appareil ne doit pas empêcher la proposition sur un autre).
const NEVER_KEY = "vivabox_install_never"
// Portée à l'onglet/l'ouverture en cours (sessionStorage, pas localStorage) :
// une fois fermée ("Ahora no"), la card ne doit pas réapparaître avant la
// prochaine ouverture de l'app/onglet, mais doit revenir à cette prochaine
// ouverture si "no volver a preguntar" n'a pas été choisi.
const PROMPTED_KEY = "vivabox_install_prompted"

const DELAY_MS = 10000

export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

// Contenu partagé entre le popup automatique (déclenché tout seul sur /mapa,
// voir InstallAppCard ci-dessous) et une ouverture manuelle (bouton "Instalar
// app" dans Ayuda, voir InstallAppModal) — seuls les boutons du bas diffèrent
// (l'auto-popup propose "Ahora no" / "No volver a preguntar", l'ouverture
// manuelle n'a besoin que de la croix puisque la personne l'a demandée).
function InstallCardBody({ onClose, footer }: { onClose: () => void; footer?: React.ReactNode }) {
  const deferredPrompt = useSyncExternalStore(
    subscribeInstallPrompt,
    getDeferredInstallPrompt,
    () => null
  )

  const [ios, setIos] = useState(false)
  const [showIosSteps, setShowIosSteps] = useState(false)

  useEffect(() => {
    setIos(isIOS())
  }, [])

  async function handleInstall() {
    if (ios) {
      setShowIosSteps(true)
      return
    }
    const prompt = deferredPrompt ?? getDeferredInstallPrompt()
    if (!prompt) return
    await prompt.prompt()
    await prompt.userChoice
    clearDeferredInstallPrompt()
    onClose()
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={closeBtn} aria-label="Cerrar">
          <X size={18} />
        </button>

        <VivaboxLogo width={56} height={56} />

        {!showIosSteps ? (
          <>
            <h3 style={title}>Instala Vivabox</h3>
            <p style={text}>
              Añade Vivabox a tu pantalla de inicio para acceder más rápido, incluso sin conexión.
            </p>
            <button className="vb-btn-primary" style={installBtn} onClick={handleInstall}>
              {ios ? <Share2 size={16} /> : <Download size={16} />}
              {ios ? "Ver cómo instalarla" : "Instalar app"}
            </button>
          </>
        ) : (
          <>
            <h3 style={title}>Instálala desde Safari</h3>
            <ol style={stepsList}>
              <li>Toca el botón Compartir (el ícono con la flecha) en la barra inferior</li>
              <li>Elige &ldquo;Añadir a pantalla de inicio&rdquo;</li>
              <li>Confirma tocando &ldquo;Añadir&rdquo;</li>
            </ol>
          </>
        )}

        {footer}
      </div>
    </div>
  )
}

// Ouverture manuelle et contrôlée (ex: bouton "Instalar app" dans Ayuda) —
// ignore volontairement NEVER_KEY/PROMPTED_KEY : ces garde-fous ne servent
// qu'à limiter le popup *non sollicité*, pas une action explicite de la
// personne qui clique sur un bouton dédié.
export function InstallAppModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return <InstallCardBody onClose={onClose} />
}

export default function InstallAppCard() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem(NEVER_KEY) === "1") return
    if (sessionStorage.getItem(PROMPTED_KEY) === "1") return

    const onIOS = isIOS()

    const timer = setTimeout(() => {
      // Sur Android/desktop, l'invite native est la seule chose qu'on peut
      // proposer : si Chrome n'a pas jugé le site installable (event jamais
      // reçu), il n'y a rien de concret à afficher. iOS n'a pas cet event —
      // les instructions manuelles restent valables dans tous les cas.
      if (!onIOS && !getDeferredInstallPrompt()) return
      setVisible(true)
    }, DELAY_MS)

    return () => clearTimeout(timer)
  }, [])

  function dismissForSession() {
    sessionStorage.setItem(PROMPTED_KEY, "1")
    setVisible(false)
  }

  function dismissForever() {
    localStorage.setItem(NEVER_KEY, "1")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <InstallCardBody
      onClose={dismissForSession}
      footer={
        <>
          <button onClick={dismissForSession} style={laterBtn}>
            Ahora no
          </button>
          <button onClick={dismissForever} style={neverBtn}>
            No volver a preguntar
          </button>
        </>
      }
    />
  )
}

/* ---------- STYLES ---------- */

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2500,
  padding: 24,
}

const card: React.CSSProperties = {
  position: "relative",
  width: "100%",
  maxWidth: 340,
  background: "#fff",
  borderRadius: 24,
  padding: "32px 24px 24px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
}

const closeBtn: React.CSSProperties = {
  position: "absolute",
  top: 12,
  right: 12,
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "none",
  background: "#F3F3F3",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
}

const title: React.CSSProperties = {
  margin: "16px 0 8px",
  fontSize: 18,
  fontWeight: 700,
  color: "#152F40",
}

const text: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "#666",
  lineHeight: 1.4,
}

const stepsList: React.CSSProperties = {
  margin: 0,
  padding: "0 0 0 20px",
  textAlign: "left",
  fontSize: 14,
  color: "#444",
  lineHeight: 1.6,
}

const installBtn: React.CSSProperties = {
  marginTop: 20,
  width: "100%",
  padding: 14,
  borderRadius: 14,
  border: "none",
  background: "#152F40",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
}

const laterBtn: React.CSSProperties = {
  marginTop: 16,
  border: "none",
  background: "none",
  color: "#888",
  fontSize: 13,
  cursor: "pointer",
}

const neverBtn: React.CSSProperties = {
  marginTop: 4,
  border: "none",
  background: "none",
  color: "#bbb",
  fontSize: 12,
  textDecoration: "underline",
  cursor: "pointer",
}
