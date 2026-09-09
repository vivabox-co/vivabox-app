import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Abre Vivabox desde tu celular",
}

// Écran affiché par le gate desktop (voir desktopGate dans middleware.ts, et
// DesktopGate.tsx pour le filet de sécurité côté client). Route publique :
// exclue du gate lui-même pour ne pas boucler, voir middleware.ts.
export default function SoloMovilPage() {
  return (
    <div style={container}>
      <div style={card}>
        <img src="/logo/LogoVivaboxSVG.svg" alt="Vivabox" style={logo} />
        <h1 style={title}>Vivabox es solo para celular</h1>
        <p style={text}>
          Esta app está pensada para usarse desde un teléfono. Abre este
          mismo enlace desde tu celular, o escanea de nuevo el código QR de
          tu Vivabox.
        </p>
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 24px",
  background: "#f5f5f5",
  boxSizing: "border-box",
}

const card: React.CSSProperties = {
  maxWidth: 420,
  width: "100%",
  background: "#fff",
  padding: "36px 24px 28px",
  borderRadius: 26,
  boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
  textAlign: "center",
}

const logo: React.CSSProperties = {
  width: 72,
  height: "auto",
  display: "block",
  margin: "0 auto 24px",
}

const title: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 650,
  lineHeight: 1.3,
  marginBottom: 12,
}

const text: React.CSSProperties = {
  fontSize: 15,
  opacity: 0.65,
  lineHeight: 1.5,
}
