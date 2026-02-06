"use client"

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import L from "leaflet"
import { useEffect, useState } from "react"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { Experience, Format, Category } from "@/lib/data/types"
import { createPinIcon } from "@/lib/map/createPinIcon"
import { categoryColors } from "@/lib/map/categoryColors"
import { useUI } from "@/components/ui/UIContext"
import { Heart } from "lucide-react"

import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"

type MapViewProps = {
  onSelect: (exp: Experience) => void
  activeCategories: Category[]
  activeFormats: Format[]
}

/* 🔁 Resize Fix */
function ResizeFix() {
  const map = useMap()
  useEffect(() => {
    const resize = () => map.invalidateSize()
    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [map])
  return null
}

/* 🎨 Cluster icon */
function createClusterIcon(color: string) {
  return (cluster: any) =>
    L.divIcon({
      html: `
        <div style="
          background:${color};
          width:46px;
          height:46px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          color:white;
          font-weight:700;
          font-size:14px;
          border:3px solid white;
          box-shadow:0 4px 12px rgba(0,0,0,0.25);
        ">
          ${cluster.getChildCount()}
        </div>
      `,
      className: "",
      iconSize: [46, 46],
    })
}

function categoryLabel(category: Category) {
  switch (category) {
    case "gastro": return "Gastronomía"
    case "bienestar": return "Bienestar"
    case "aventura": return "Aventura"
    case "cultura": return "Cultura"
    case "estancias": return "Estancias"
    default: return category
  }
}

function formatLabel(format: Format) {
  switch (format) {
    case "solo": return "Para uno"
    case "duo": return "Para dos"
    case "familia": return "En familia"
    default: return format
  }
}

export default function MapView({
  onSelect,
  activeCategories,
  activeFormats,
}: MapViewProps) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const { favorites, toggleFavorite } = useUI()

  useEffect(() => {
    fetchExperiences().then(setExperiences)
  }, [])

  const filtered = experiences.filter((exp) =>
    activeCategories.includes(exp.category) &&
    activeFormats.includes(exp.format)
  )

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <MapContainer
        center={[4.65, -74.08]}
        zoom={13}
        zoomControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <ResizeFix />

        <TileLayer
          attribution={""}
          url="https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png"
        />

        {Object.entries(categoryColors).map(([rawCategory, color]) => {
          const category = rawCategory as Category
          const exps = filtered.filter((e) => e.category === category)
          if (!exps.length) return null

          return (
            <MarkerClusterGroup
              key={category}
              chunkedLoading
              showCoverageOnHover={false}
              maxClusterRadius={60}
              iconCreateFunction={createClusterIcon(color)}
            >
              {exps.map((exp) => {
                const isFav = favorites.includes(exp.id)

                return (
                  <Marker
                    key={exp.id}
                    position={[exp.lat, exp.lng]}
                    icon={createPinIcon(color, exp.activity_key, isFav)}
                  >
                    <Popup>
                      <div style={{ width: 210 }}>
                        <div style={{
                          position: "relative",
                          height: 110,
                          borderRadius: 10,
                          overflow: "hidden",
                          background: "#eee",
                        }}>
                          <img
                            src={exp.image}
                            alt={exp.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />

                          <div style={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            padding: "4px 8px",
                            fontSize: 10,
                            fontWeight: 600,
                            color: "white",
                            background: color,
                            borderRadius: 8,
                          }}>
                            {categoryLabel(exp.category)}
                          </div>

                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toggleFavorite(exp.id)
                            }}
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              background: "rgba(255,255,255,0.95)",
                              borderRadius: "50%",
                              border: "none",
                              width: 34,
                              height: 34,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                            }}
                          >
                            <Heart
                              size={16}
                              fill={isFav ? "#ff4d6d" : "none"}
                              color={isFav ? "#ff4d6d" : "#777"}
                            />
                          </button>
                        </div>

                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>
                            {exp.title}
                          </div>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            {formatLabel(exp.format)}
                          </div>

                          {/* 🔥 CTA NOIR */}
                          <button
                            style={{
                              marginTop: 10,
                              width: "100%",
                              padding: "9px 10px",
                              fontSize: 14,
                              borderRadius: 10,
                              border: "none",
                              background: "#111",
                              color: "white",
                              fontWeight: 600,
                              cursor: "pointer",
                              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                            }}
                            onClick={() => onSelect(exp)}
                          >
                            Ver experiencia
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MarkerClusterGroup>
          )
        })}
      </MapContainer>
    </div>
  )
}
