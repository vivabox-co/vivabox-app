"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import BookingTimeline, { BookingStatus } from "@/components/ui/BookingTimeline"
import DynamicStatusBlock from "@/components/ui/DynamicStatusBlock"
import ExperienceSummaryCard from "@/components/list/ExperienceSummaryCard"
import BottomSheet from "@/components/ui/BottomSheet"
import ExperienceBookedContent from "@/components/experience/ExperienceBookedContent"
import { useUI } from "@/components/ui/UIContext"
import { fetchExperiences } from "@/lib/data/fetchExperiences"

export default function SeguimientoPage() {
  const [booking, setBooking] = useState<any>(null)
  const [realExperience, setRealExperience] = useState<any>(null)

  const {
    setActiveExperience,
    setDrawerOpen,
    drawerOpen,
    setHideNav,
  } = useUI()

  /* Nav visible */
  useEffect(() => {
    setHideNav(false)
  }, [setHideNav])

  /* Charger booking */
  useEffect(() => {
    const stored = localStorage.getItem("currentBooking")
    if (stored) setBooking(JSON.parse(stored))
  }, [])

  /* Charger vraie expérience */
  useEffect(() => {
    if (!booking?.experienceId) return
    fetchExperiences().then((list) => {
      const found = list.find((e) => e.id === booking.experienceId)
      if (found) setRealExperience(found)
    })
  }, [booking])

  /* Simulation status */
  useEffect(() => {
    if (!booking) return

    if (booking.status === "requested") {
      setTimeout(() => {
        const updated = { ...booking, status: "waiting_provider" }
        setBooking(updated)
        localStorage.setItem("currentBooking", JSON.stringify(updated))
      }, 10000)
    }

    if (booking.status === "waiting_provider") {
      setTimeout(() => {
        const updated = { ...booking, status: "confirmed" }
        setBooking(updated)
        localStorage.setItem("currentBooking", JSON.stringify(updated))
      }, 20000)
    }
  }, [booking])

  /* ⛔ Si booking pas encore prêt */
  if (!booking) {
    return (
      <div style={{ padding: 24, minHeight: "100vh", background: "#FAF8F5" }}>
        Cargando...
      </div>
    )
  }

  const statuses: BookingStatus[] = [
    "requested",
    "waiting_provider",
    "confirmed",
    "done",
  ]

  const status: BookingStatus = booking.status || "requested"

  function changeStatus(direction: "next" | "prev") {
    const currentIndex = statuses.indexOf(status)
    const newIndex =
      direction === "next"
        ? Math.min(currentIndex + 1, statuses.length - 1)
        : Math.max(currentIndex - 1, 0)

    const updated = { ...booking, status: statuses[newIndex] }
    setBooking(updated)
    localStorage.setItem("currentBooking", JSON.stringify(updated))
  }

  const snapshot = booking.experienceSnapshot || {}

  return (
    <>
      <div style={{ padding: "16px 16px 120px", background: "#FAF8F5", minHeight: "100vh" }}>
        <h1 style={{ marginTop: 6, marginBottom: 16, fontSize: 26, fontWeight: 600 }}>
          Seguimiento
        </h1>

        {/* CARD EXPERIENCE */}
        <div style={{ marginBottom: 18 }}>
          <ExperienceSummaryCard
            title={snapshot.title || "Experiencia"}
            subtitle=""
            location={snapshot.zone || ""}
            format=""
            image={snapshot.image || "/images/placeholder.jpg"}
            date={booking.date}
            time={booking.time}
            category={"gastro"}
            onClick={() => {
              if (realExperience) {
                setActiveExperience(realExperience)
                setDrawerOpen(true)
              }
            }}
          />
        </div>

        {/* DEBUG NAV */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          opacity: 0.4,
          marginBottom: 8,
        }}>
          <button onClick={() => changeStatus("prev")} style={{ background: "none", border: "none" }}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => changeStatus("next")} style={{ background: "none", border: "none" }}>
            <ChevronRight size={18} />
          </button>
        </div>

        <BookingTimeline status={status} category={"gastro"} />

        <div style={{ marginTop: 28, marginBottom: 60 }}>
          <DynamicStatusBlock status={status} />
        </div>
      </div>

      {/* BOTTOM SHEET */}
      <BottomSheet
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        body={
          realExperience ? (
            <ExperienceBookedContent
              exp={realExperience}
              date={booking.date}
              time={booking.time}
              status={status}
            />
          ) : (
            <div style={{ padding: 40, textAlign: "center" }}>
              Cargando experiencia...
            </div>
          )
        }
      />
    </>
  )
}
