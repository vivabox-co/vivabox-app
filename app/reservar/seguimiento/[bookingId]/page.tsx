"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import BookingTimeline, { BookingStatus } from "@/components/ui/BookingTimeline"
import DynamicStatusBlock from "@/components/ui/DynamicStatusBlock"
import ExperienceSummaryCard from "@/components/list/ExperienceSummaryCard"
import { useUI } from "@/components/ui/UIContext"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { Booking } from "@/lib/data/types/booking"
import { Experience } from "@/lib/data/types"

export default function SeguimientoPage() {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [realExperience, setRealExperience] = useState<Experience | null>(null)

  const { setActiveExperience, setHideNav } = useUI()
  const router = useRouter()

  /* NAV */
  useEffect(() => {
    setHideNav(false)
  }, [setHideNav])

  /* LOAD BOOKING */
  useEffect(() => {
    const stored = localStorage.getItem("currentBooking")
    if (stored) setBooking(JSON.parse(stored))
  }, [])

  /* LOAD REAL EXPERIENCE */
  useEffect(() => {
    if (!booking?.experienceId) return
    fetchExperiences().then((list) => {
      const found = list.find((e) => e.id === booking.experienceId)
      if (found) setRealExperience(found)
    })
  }, [booking])

  /* AUTO ADVANCE: requested → waiting_provider */
  useEffect(() => {
    if (!booking) return
    if (booking.status === "requested") {
      const t1 = setTimeout(() => {
        updateStatus("waiting_provider")
      }, 6000)
      return () => clearTimeout(t1)
    }
  }, [booking])

  /* ===== DEV TIMELINE CONTROLS ===== */

  const statusOrder: BookingStatus[] = [
    "requested",
    "waiting_provider",
    "confirmed",
    "done",
  ]

  function updateStatus(newStatus: BookingStatus) {
    if (!booking) return
    const updated = { ...booking, status: newStatus }
    setBooking(updated)
    localStorage.setItem("currentBooking", JSON.stringify(updated))
  }

  function goNextStatus() {
    if (!booking) return
    const index = statusOrder.indexOf(booking.status)
    if (index < statusOrder.length - 1) {
      updateStatus(statusOrder[index + 1])
    }
  }

  function goPrevStatus() {
    if (!booking) return
    const index = statusOrder.indexOf(booking.status)
    if (index > 0) {
      updateStatus(statusOrder[index - 1])
    }
  }

  /* LOADING */
  if (!booking) {
    return (
      <div style={{ padding: 24, minHeight: "100vh", background: "#FAF8F5" }}>
        Cargando...
      </div>
    )
  }

  const status: BookingStatus = booking.status
  const exp = booking.experienceSnapshot

  const badgeMap: Record<string, string | null> = {
    requested: "En preparación",
    waiting_provider: "Coordinando",
    confirmed: "Reservado",
    done: null,
  }

  return (
    <div style={{ padding: "16px 16px 120px", background: "#FAF8F5", minHeight: "100vh" }}>

      <h1 style={{ marginTop: 6, marginBottom: 4, fontSize: 24, fontWeight: 600 }}>
        Todo se está organizando para ti
      </h1>
      <p style={{ marginBottom: 18, color: "#666", fontSize: 14 }}>
        Estamos coordinando con el lugar.
      </p>

      <div style={{ marginBottom: 18 }}>
        <ExperienceSummaryCard
          title={exp.title}
          location={exp.zone}
          image={exp.image}
          date={booking.date}
          format={realExperience?.format}
          time={booking.time}
          category={exp.category}
          badge={badgeMap[status]}
          onClick={() => {
            if (realExperience) {
              setActiveExperience(realExperience)
              router.push("/experiencia")
            }
          }}
        />
      </div>

      <BookingTimeline
        status={status}
        category={exp.category}
        onNext={process.env.NODE_ENV === "development" ? goNextStatus : undefined}
        onPrev={process.env.NODE_ENV === "development" ? goPrevStatus : undefined}
      />

      <div style={{ marginTop: 28 }}>
        <DynamicStatusBlock status={status} />
      </div>

      <div style={{
        marginTop: 32,
        padding: 16,
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
      }}>
        <p style={{ marginBottom: 6, fontWeight: 500 }}>
          Ese día vas a estar aquí.
        </p>
        <p style={{ color: "#666", fontSize: 14 }}>
          Un momento que ya tiene fecha.
        </p>
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <span style={{ fontSize: 13, color: "#777" }}>
          ¿Tienes una duda? Estamos aquí.
        </span>
      </div>

    </div>
  )
}
