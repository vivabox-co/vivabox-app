import { Experience } from "@/lib/data/types"
import { Heart } from "lucide-react"
import { useUI } from "@/components/ui/UIContext"

export default function ExperienceExploreHeader({ exp }: { exp: Experience }) {
  const { favorites, toggleFavorite } = useUI()
  const isFav = favorites.includes(exp.id)

  return (
    <>
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>{exp.title}</h2>
          <button onClick={() => toggleFavorite(exp.id)} style={{ background: "none", border: "none" }}>
            <Heart size={22} fill={isFav ? "#ff4d6d" : "none"} color="#ff4d6d" />
          </button>
        </div>
        <p style={{ opacity: 0.6 }}>{exp.zone}</p>
      </div>

      <div style={{ padding: 16 }}>
        <img src={exp.image} style={{ width: "100%", borderRadius: 16 }} />
      </div>
    </>
  )
}
