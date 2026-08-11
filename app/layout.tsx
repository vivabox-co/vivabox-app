import "./globals.css"
import type { Viewport } from "next"
import { ReactNode } from "react"
import { UIProvider } from "@/components/ui/UIContext"
import ClientLayout from "./ClientLayout"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
