"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import BottomNav from "@/components/ui/BottomNav"
import { useUI } from "@/components/ui/UIContext"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { hideNav } = useUI()

  useEffect(() => {
    function handleBack() {
      const hasBooking = !!localStorage.getItem("currentBooking")

      const inBookingFlow =
        pathname.startsWith("/reservar/seguimiento") ||
        pathname.startsWith("/experiencia") ||
        pathname.startsWith("/ayuda")

      if (hasBooking && inBookingFlow) {
        router.replace("/reservar/seguimiento")
      }
    }

    window.addEventListener("popstate", handleBack)
    return () => window.removeEventListener("popstate", handleBack)
  }, [pathname, router])

  return (
    <>
      {children}
      {!hideNav && <BottomNav />}
    </>
  )
}
