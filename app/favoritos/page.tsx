"use client"

import { useEffect, useState, useMemo } from "react"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { Experience } from "@/lib/data/types"
import BottomSheet from "@/components/ui/BottomSheet"
import ListCard from "@/components/list/ListCard"
import { useUI } from "@/components/ui/UIContext"
import { Heart } from "lucide-react"

export default function FavoritosPage() {
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

  useEffect(() => {
    fetchExperiences().then(setExperiences)
  }, [])

  const favoriteExperiences = useMemo(() => {
    return experiences.filter(exp => favorites.includes(exp.id))
  }, [experiences, favorites])

  function openDrawer(exp: Experience) {
    setSelectedExperience(exp)
    setDrawerOpen(true)
  }

  function handleAskRemove(id: string) {
    setConfirmId(id)
  }

  return (
    <>
      <div style={{ padding: "12px 12px 70px" }}>
        <h2 style={{ marginBottom: 12 }}>Tus favoritos</h2>

        {favoriteExperiences.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 70 }}>
            {/* 💗 COEUR VIVO */}
            <div style={{ marginBottom: 14 }}>
              <Heart
                size={40}
                strokeWidth={1.5}
                color="#ff6fa3"
                fill="#ff6fa3"
              />
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
              onToggleFavorite={() => handleAskRemove(exp.id)}
            />
          ))
        )}
      </div>

      {/* DRAWER */}
      <BottomSheet
        open={drawerOpen}
        experience={selectedExperience}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedExperience && (
          <div style={{ padding: 16 }}>
            <p>{selectedExperience.vivanote}</p>

            <div style={{ marginTop: 12, fontSize: 14 }}>
              <strong>Formato:</strong>{" "}
              {selectedExperience.format === "duo" ? "Para dos" : "Para uno"}
            </div>

            <div style={{ marginTop: 4, fontSize: 14 }}>
              <strong>Duración:</strong> {selectedExperience.duration}
            </div>

            <div style={{ marginTop: 4, fontSize: 14 }}>
              <strong>Zona:</strong> {selectedExperience.zone}
            </div>
          </div>
        )}
      </BottomSheet>

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
