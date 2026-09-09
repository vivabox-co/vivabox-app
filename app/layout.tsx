import "./globals.css"
import type { Metadata, Viewport } from "next"
import { ReactNode } from "react"
import { UIProvider } from "@/components/ui/UIContext"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
  title: "Vivabox",
  description: "Activa tu código Vivabox y reserva tu experiencia",
  appleWebApp: {
    title: "Vivabox",
    statusBarStyle: "black-translucent",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#152F40",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  // NODE_ENV plutôt qu'une variable NEXT_PUBLIC_* : lu côté serveur puis
  // passé en prop, il n'a pas besoin d'être exposé au bundle client. Vaut
  // "production" aussi bien en preview qu'en prod Vercel (seul `next dev`
  // en local vaut "development") — voir desktopGate dans middleware.ts,
  // qui applique la même règle côté serveur.
  const desktopGateEnabled = process.env.NODE_ENV === "production"

  return (
    <html lang="es">
      <body>
        <UIProvider>
          <div className="app-shell">
            <div className="app-content">
              <ClientLayout desktopGateEnabled={desktopGateEnabled}>
                {children}
              </ClientLayout>
            </div>
          </div>
        </UIProvider>
      </body>
    </html>
  )
}
