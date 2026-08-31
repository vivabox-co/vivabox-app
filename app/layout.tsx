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
  return (
    <html lang="es">
      <body>
        <UIProvider>
          <div className="app-shell">
            <div className="app-content">
              <ClientLayout>
                {children}
              </ClientLayout>
            </div>
          </div>
        </UIProvider>
      </body>
    </html>
  )
}
