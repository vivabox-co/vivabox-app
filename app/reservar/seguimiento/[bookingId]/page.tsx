"use client"

import { useEffect, useState } from "react"
import BookingTimeline from "@/components/ui/BookingTimeline"
import DynamicStatusBlock from "@/components/ui/DynamicStatusBlock"
import ExperienceSummaryCard from "@/components/list/ExperienceSummaryCard"
import BottomSheet from "@/components/ui/BottomSheet"
import ExperienceBookedContent from "@/components/experience/ExperienceBookedContent"
import { useUI } from "@/components/ui/UIContext"

export default function SeguimientoPage() {
  const [booking, setBooking] = useState<any>(null)

  const {
    setActiveExperience,
    setDrawerOpen,
    drawerOpen,
    activeExperience,
    setHideNav,
  } = useUI()

  /* 🔥 Bottom nav visible en seguimiento */
  useEffect(() => {
    setHideNav(false)
  }, [setHideNav])

  /* 🔥 Charger la réservation depuis localStorage */
  useEffect(() => {
    const stored = localStorage.getItem("currentBooking")
    if (stored) setBooking(JSON.parse(stored))
  }, [])

  function updateStep(newStep: number) {
    const updated = { ...booking, step: newStep }
    setBooking(updated)
    localStorage.setItem("currentBooking", JSON.stringify(updated))
  }

  if (!booking) {
    return (
      <div
        style={{
          padding: 24,
          minHeight: "100vh",
          background: "#FAF8F5",
        }}
      >
        Cargando...
      </div>
    )
  }

  return (
    <>
      {/* PAGE */}
      <div
        style={{
          padding: "16px 16px 120px",
          background: "#FAF8F5",
          minHeight: "100vh",
        }}
      >
        <h1
          style={{
            marginTop: 6,
            marginBottom: 16,
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          Seguimiento
        </h1>

        {/* CARD EXPERIENCE (ouvre drawer info) */}
        <div style={{ marginBottom: 18 }}>
          <ExperienceSummaryCard
            title={booking.experience.title}
            subtitle={booking.experience.subtitle || ""}
            location={booking.experience.zone}
            format={booking.experience.format}
            image={booking.experience.image}
            date={booking.date}
            time={booking.time}
            category={booking.experience.category}
            onClick={() => {
              setActiveExperience(booking.experience)
              setDrawerOpen(true)
            }}
          />
        </div>

        {/* TIMELINE */}
        <div style={{ marginTop: 18 }}>
          <BookingTimeline
            step={booking.step}
            setStep={updateStep}
            category={booking.experience.category}
          />
        </div>

        {/* STATUS BLOCK */}
        <div style={{ marginTop: 28, marginBottom: 60 }}>
          <DynamicStatusBlock step={booking.step} />
        </div>
      </div>

      {/* 🔥 BOTTOM SHEET INFO POST-RÉSERVATION */}
      <BottomSheet open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {activeExperience && (
          <ExperienceBookedContent
            exp={activeExperience}
            date={booking.date}
            time={booking.time}
            step={booking.step}
          />
        )}
      </BottomSheet>
    </>
  )
}
