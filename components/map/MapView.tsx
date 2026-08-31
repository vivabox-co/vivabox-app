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
import { useEffect, useMemo, useState } from "react"

import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { getExperiencePhotos } from "@/lib/data/getExperiencePhotos"
import { Experience, Format, Category, ActivityKey } from "@/lib/data/types"
import { createPinIcon } from "@/lib/map/createPinIcon"
import { categoryColors } from "@/lib/map/categoryColors"
import { categoryLabel } from "@/lib/map/categoryLabels"
import { formatLabel } from "@/lib/map/formatLabels"
import { useUI } from "@/components/ui/UIContext"
import PhotoGallery from "@/components/ui/PhotoGallery"
import { Heart, MapPin, Users, Locate } from "lucide-react"
import { filterExperiences } from "@/lib/product/filterExperiences"

import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"

type MapViewProps = {
  onSelect: (exp: Experience) => void
  activeCategories: Category[]
  activeFormats: Format[]
  activeCities?: string[]
  activeAmbiances?: string[]
  indoorState?: "indoor" | "outdoor" | "any"
  activeActivities?: ActivityKey[]
  /** Called once the initially visible tile batch has finished loading. */
  onFirstTilesLoaded?: () => void
}

/* 🔁 SAFE resize fix */
function ResizeFix() {
  const map = useMap()

  useEffect(() => {
    const id = setTimeout(() => {
      map.invalidateSize()
    }, 0)

    const onResize = () => map.invalidateSize()
    window.addEventListener("resize", onResize)

    return () => {
      clearTimeout(id)
      window.removeEventListener("resize", onResize)
    }
  }, [map])

  return null
}

/* 📍 Fly to user location when it becomes available */
function FlyToPosition({ position }: { position: [number, number] | null }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1.2 })
    }
  }, [position, map])

  return null
}

/* 🔵 Blue dot icon for the user's current location */
function createUserLocationIcon() {
  return L.divIcon({
    html: `
      <div class="vb-user-location">
        <div class="vb-user-location-pulse"></div>
        <div class="vb-user-location-dot"></div>
      </div>
    `,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
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

export default function MapView({
  onSelect,
  activeCategories,
  activeFormats,
  activeCities = [],
  activeAmbiances = [],
  indoorState = "any",
  activeActivities = [],
  onFirstTilesLoaded,
}: MapViewProps) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [mapReady, setMapReady] = useState(false)
  // Charge seulement les tuiles visibles au départ (keepBuffer 0) pour un
  // premier affichage rapide ; une fois ce lot chargé, on relève le buffer
  // pour que les tuiles voisines se préchargent tranquillement en arrière-
  // plan avant que l'utilisateur ne déplace la carte.
  const [tileBuffer, setTileBuffer] = useState(0)
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const { favorites, toggleFavorite } = useUI()

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no permite acceder a la ubicación.")
      return
    }

    setLocating(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude])
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Activa la ubicación en tu navegador para ver qué hay cerca de ti."
            : "No pudimos obtener tu ubicación. Intenta de nuevo."
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  useEffect(() => {
    fetchExperiences().then(setExperiences)
  }, [])

  const { filteredExperiences } = useMemo(() => {
    return filterExperiences(experiences, {
      categories: activeCategories,
      formats: activeFormats,
      cities: activeCities,
      ambiances: activeAmbiances,
      indoorState,
      activities: activeActivities,
    })
  }, [
    experiences,
    activeCategories,
    activeFormats,
    activeCities,
    activeAmbiances,
    indoorState,
    activeActivities,
  ])

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <MapContainer
        center={[4.65, -74.08]}
        zoom={13}
        zoomControl={false}
        style={{ width: "100%", height: "100%", background: "#f4f1ea" }}
        whenReady={() => setMapReady(true)}
      >
        {mapReady && <ResizeFix />}

        {mapReady && (
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png"
            keepBuffer={tileBuffer}
            eventHandlers={{
              // Une fois le lot visible chargé, on relève le buffer pour
              // précharger les tuiles voisines en arrière-plan (sans
              // bloquer quoi que ce soit à l'écran). C'est aussi le premier
              // moment où la carte est réellement visible à l'écran, donc
              // le signal qu'on remonte au loader plein écran de la route.
              // Différé via setTimeout : quand les tuiles sont déjà en
              // cache navigateur, Leaflet peut émettre "load" de façon
              // synchrone pendant le rendu de ce composant, et appeler le
              // setState du parent (onFirstTilesLoaded) à ce moment-là
              // déclenche l'avertissement React "setState pendant le rendu
              // d'un autre composant".
              load: () => setTileBuffer((b) => {
                if (b === 0) setTimeout(() => onFirstTilesLoaded?.(), 0)
                return b === 0 ? 2 : b
              }),
            }}
          />
        )}

        {mapReady && userPosition && <FlyToPosition position={userPosition} />}

        {mapReady && userPosition && (
          <Marker
            position={userPosition}
            icon={createUserLocationIcon()}
            interactive={false}
            zIndexOffset={1000}
          />
        )}

        {mapReady &&
          Object.entries(categoryColors).map(([rawCategory, color]) => {
            const category = rawCategory as Category
            const exps = filteredExperiences.filter(
              (e) => e.category === category
            )
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
                  const lat = Number(exp.lat)
                  const lng = Number(exp.lng)
                  if (isNaN(lat) || isNaN(lng)) return null

                  return (
                    <Marker
                      key={exp.id}
                      position={[lat, lng]}
                      alt={exp.title}
                      icon={createPinIcon(
                        color,
                        exp.activity_key || "",
                        isFav,
                        exp.title
                      )}
                    >
                      {/* Réserve l'espace de la barre du haut (Filtros +
                          légende catégories, ~150px) pour que l'auto-pan de
                          Leaflet ne fasse jamais apparaître un popup masqué
                          derrière cette barre fixe. */}
                      <Popup autoPanPaddingTopLeft={[20, 150]} autoPanPaddingBottomRight={[20, 20]}>
                        <div style={{ width: 220 }}>
                          <PopupGallery
                            exp={exp}
                            color={color}
                            isFav={isFav}
                            onSelect={onSelect}
                            onToggleFavorite={toggleFavorite}
                          />

                          <div style={{ marginTop: 10 }}>
                            <div
                              style={{ fontSize: 14, fontWeight: 600 }}
                            >
                              {exp.title}
                            </div>

                            <MetaRow icon={MapPin} text={exp.city || exp.zone} />
                            <MetaRow
                              icon={Users}
                              text={formatLabel(exp.format)}
                            />

                            <button
                              className="vb-btn-primary"
                              style={{
                                marginTop: 10,
                                width: "100%",
                                padding: "9px 10px",
                                fontSize: 14,
                                borderRadius: 10,
                                border: "none",
                                background: "#152F40",
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

      <button
        onClick={handleLocate}
        disabled={locating}
        aria-label="Ver mi ubicación"
        style={{
          // `fixed` (et non `absolute`) pour partager le même référentiel
          // que .bottom-nav-help (également `fixed`, ancré au vrai viewport) :
          // le wrapper de MapView est dimensionné en 100dvh, une unité qui
          // peut diverger légèrement du viewport réel juste après un
          // rechargement (ex. reconnexion) sur PWA Android tant que la barre
          // système se stabilise, ce qui désynchronisait ce bouton — resté
          // "absolute" et donc calé sur ce wrapper — de la bulle Ayuda.
          position: "fixed",
          right: 16,
          // Remonté au-dessus du bouton Ayuda flottant de BottomNav.tsx
          // (.bottom-nav-help), dont le bord haut est à
          // calc(114px + safe-area) — même formule + 16px de marge, pour
          // rester valable quel que soit le safe-area-inset-bottom.
          bottom: "calc(130px + env(safe-area-inset-bottom))",
          zIndex: 1000,
          width: 46,
          height: 46,
          borderRadius: "50%",
          border: "none",
          background: "#fff",
          boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: locating ? "default" : "pointer",
        }}
      >
        {locating ? (
          <div className="vb-spinner" style={{ width: 20, height: 20 }} />
        ) : (
          <Locate size={22} color={userPosition ? "#1a73e8" : "#111"} />
        )}
      </button>

      {geoError && (
        <div
          style={{
            // Même raison qu'au-dessus (bouton "Ver mi ubicación") : `fixed`
            // pour rester ancré au vrai viewport, pas au wrapper 100dvh.
            position: "fixed",
            right: 16,
            bottom: "calc(184px + env(safe-area-inset-bottom))",
            zIndex: 1000,
            maxWidth: 220,
            background: "#111",
            color: "#fff",
            fontSize: 12,
            padding: "8px 10px",
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          }}
        >
          {geoError}
        </div>
      )}
    </div>
  )
}

/* 🖼️ Galerie horizontale du popup — utilise le composant PhotoGallery
   partagé avec le bottomsheet (scroll-snap + dots cliquables + drag). */
function PopupGallery({
  exp,
  color,
  isFav,
  onSelect,
  onToggleFavorite,
}: {
  exp: Experience
  color: string
  isFav: boolean
  onSelect: (exp: Experience) => void
  onToggleFavorite: (id: string) => void
}) {
  const photos = getExperiencePhotos(exp)

  return (
    <div
      style={{
        position: "relative",
        height: 120,
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <PhotoGallery
        photos={photos}
        alt={exp.title}
        dotsBottom={8}
        onImageClick={() => onSelect(exp)}
      >
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            padding: "4px 8px",
            fontSize: 10,
            fontWeight: 600,
            color: "white",
            background: color,
            borderRadius: 8,
            pointerEvents: "none",
          }}
        >
          {categoryLabel(exp.category)}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleFavorite(exp.id)
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
      </PhotoGallery>
    </div>
  )
}

function MetaRow({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        fontSize: 12,
        color: "#666",
        marginTop: 4,
      }}
    >
      <Icon size={14} />
      <span>{text}</span>
    </div>
  )
}
