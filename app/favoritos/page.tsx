"use client"

import { useEffect, useState, useMemo } from "react"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { Experience } from "@/lib/data/types"
import BottomSheet from "@/components/ui/BottomSheet"
import ExperienceExploreMeta from "@/components/experience/ExperienceExploreMeta"
import ListCard from "@/components/list/ListCard"
import { useUI, usePageReady } from "@/components/ui/UIContext"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"

export default function FavoritosPage() {
  const router = useRouter()

  const {
    favorites,
    toggleFavorite,
    drawerOpen,
    setDrawerOpen,
    selectedExperience,
    setSelectedExperience,
  } = useUI()

  const [experiences, setExperiences] = useState<Experience[]>([])
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExperiences()
      .then(setExperiences)
      .finally(() => setLoading(false))
  }, [])

  usePageReady(!loading)

  const favoriteExperiences = useMemo(() => {
    return experiences.filter(exp => favorites.includes(exp.id))
  }, [experiences, favorites])

  function openDrawer(exp: Experience) {
    setSelectedExperience(exp)
    setDrawerOpen(true)
  }

  function handleChoose(exp: Experience) {
    setSelectedExperience(exp)
    setDrawerOpen(false)
    router.push("/reservar/fechas")
  }

  return (
    <>
      <div style={{ padding: "12px 12px 90px" }}>
        <h2 style={{ marginBottom: 12 }}>Tus favoritos</h2>

        {favoriteExperiences.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 70 }}>
            <div style={{ marginBottom: 14 }}>
              <Heart size={40} strokeWidth={1.5} color="#ff6fa3" fill="#ff6fa3" />
            </div>
            <p style={{ marginBottom: 4 }}>
              Aún no guardaste experiencias.
            </p>
            <p style={{ opacity: 0.6 }}>
              Tocá el corazón para guardar tus preferidas.
            </p>
          </div>
        ) : (
          favoriteExperiences.map(exp => (
            <ListCard
              key={exp.id}
              exp={exp}
              onClick={() => openDrawer(exp)}
              isFavorite={true}
              onToggleFavorite={() => setConfirmId(exp.id)}
            />
          ))
        )}
      </div>

      {/* 🔥 DRAWER UNIFIÉ */}
      {/* DRAWER UNIFIÉ (identique à mapa) */}
<BottomSheet
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  body={
    selectedExperience && (
      <ExperienceExploreMeta
        exp={selectedExperience}
        onChoose={() => {
          setDrawerOpen(false)
          router.push("/reservar/fechas")
        }}
      />
    )
  }
  footer={
    selectedExperience && (
      <button
        className="cta-button"
        onClick={() => {
          setDrawerOpen(false)
          router.push("/reservar/fechas")
        }}
      >
        Elegir esta experiencia
      </button>
    )
  }
/>


      {/* MODAL REMOVE FAVORITE */}
      {confirmId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "flex-end",
            zIndex: 2000,
          }}
          onClick={() => setConfirmId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              background: "white",
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              padding: 20,
            }}
          >
            <p style={{ marginBottom: 16 }}>
              ¿Quitar esta experiencia de tus favoritos?
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setConfirmId(null)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: "white",
                }}
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  toggleFavorite(confirmId)
                  setConfirmId(null)
                }}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  border: "none",
                  background: "#111",
                  color: "white",
                }}
              >
                Quitar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
