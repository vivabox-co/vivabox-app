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
import { Heart, MapPin, Clock, Users } from "lucide-react"

import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"

type MapViewProps = {
  onSelect: (exp: Experience) => void
  activeCategories: Category[]
  activeFormats: Format[]

  /* 🔥 Filtres drawer Vivabox */
  activeCities?: string[]
  activeAmbiances?: string[]
  indoorState?: "indoor" | "outdoor" | "any"
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
      html: `<div style="
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
      ">${cluster.getChildCount()}</div>`,
      className: "",
      iconSize: [46, 46],
    })
}

function categoryLabel(category: Category) {
  return {
    gastro: "Gastronomía",
    bienestar: "Bienestar",
    aventura: "Aventura",
    cultura: "Cultura",
    estancias: "Estancias",
  }[category]
}

function formatLabel(format: Format) {
  return {
    solo: "Para uno",
    duo: "Para dos",
    familia: "En familia",
  }[format]
}

export default function MapView({
  onSelect,
  activeCategories,
  activeFormats,
  activeCities = [],
  activeAmbiances = [],
  indoorState = "any",
}: MapViewProps) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const { favorites, toggleFavorite } = useUI()

  useEffect(() => {
    fetchExperiences().then(setExperiences)
  }, [])

  /* 🔥 MOTEUR FILTRAGE PRODUIT CENTRAL */
  const filtered = experiences.filter((exp) => {
    if (!activeCategories.includes(exp.category)) return false
    if (!activeFormats.includes(exp.format)) return false

    /* Ville */
    if (activeCities.length && !activeCities.includes(exp.zone)) return false

    /* Ambiance */
    if (
      activeAmbiances.length &&
      (!exp.ambiance || !exp.ambiance.some((a) => activeAmbiances.includes(a)))
    ) return false

    /* Indoor / Outdoor */
    if (indoorState !== "any" && exp.environment !== indoorState) return false

    return true
  })

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
          attribution=""
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
                      <div style={{ width: 220 }}>
                        <div style={{
                          position: "relative",
                          height: 120,
                          borderRadius: 10,
                          overflow: "hidden"
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

                          <MetaRow icon={MapPin} text={exp.zone} />
                          <MetaRow icon={Clock} text={exp.duration} />
                          <MetaRow icon={Users} text={formatLabel(exp.format)} />

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

function MetaRow({ icon: Icon, text }: any) {
  return (
    <div style={{ display: "flex", gap: 6, fontSize: 12, color: "#666", marginTop: 4 }}>
      <Icon size={14} />
      <span>{text}</span>
    </div>
  )
}
