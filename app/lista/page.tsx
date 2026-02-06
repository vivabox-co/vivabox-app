"use client"

import { Experience } from "@/lib/data/types"
import BottomSheet from "@/components/ui/BottomSheet"
import ListView from "@/components/list/ListView"
import ExperienceExploreMeta from "@/components/experience/ExperienceExploreMeta"
import { useUI } from "@/components/ui/UIContext"
import { useRouter } from "next/navigation"

export default function ListaPage() {
  const router = useRouter()

  const {
    selectedExperience,
    setSelectedExperience,
    drawerOpen,
    setDrawerOpen,
  } = useUI()

  function handleChoose() {
    if (!selectedExperience) return
    setDrawerOpen(false)
    router.push("/reservar/fechas")
  }

  return (
    <>
      {/* LISTE DES EXPÉRIENCES */}
      <ListView
        onSelect={(exp: Experience) => {
          setSelectedExperience(exp)
          setDrawerOpen(true)
        }}
      />

      {/* DRAWER UNIFIÉ (identique à mapa) */}
<BottomSheet open={drawerOpen} onClose={() => setDrawerOpen(false)}>
  {selectedExperience && (
    <ExperienceExploreMeta
      exp={selectedExperience}
      onChoose={() => {
        setDrawerOpen(false)
        router.push("/reservar/fechas")
      }}
    />
  )}
</BottomSheet>

    </>
  )
}
