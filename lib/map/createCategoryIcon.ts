import L from "leaflet"
import { categoryColors } from "./categoryColors"
import { Activity } from "@/lib/data/types"

/* Normalise activité venant du Sheet */
function normalizeActivity(activity: string): Activity {
  return activity.trim().toLowerCase() as Activity
}

/**
 * Pin Vivabox
 * Couleur = catégorie
 * Icône = activité
 * Anneau doré = favori
 */
export function createCategoryIcon(
  category: string,
  activity: Activity,
  isFavorite: boolean = false
) {
  const color = categoryColors[category] || "#111111"
  const icon = getActivitySVG(normalizeActivity(activity))

  const svg = `
    <svg width="30" height="44" viewBox="0 0 30 44" xmlns="http://www.w3.org/2000/svg">
      
      <!-- Pin -->
      <path
        d="M15 0C7 0 0 7 0 15c0 11 15 29 15 29s15-18 15-29C30 7 23 0 15 0z"
        fill="${color}"
        stroke="${isFavorite ? "#FFD700" : "white"}"
        stroke-width="${isFavorite ? 3 : 2}"
      />

      <!-- Cercle blanc central -->
      <circle cx="15" cy="16" r="7" fill="white"/>

      <!-- Icône activité (centrée) -->
      <g transform="translate(9,10)">
        ${icon}
      </g>

    </svg>
  `

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [30, 44],
    iconAnchor: [15, 44],
    popupAnchor: [0, -40],
  })
}

/* ================================
   ACTIVITY SVG ICONS
================================ */

function getActivitySVG(activity: Activity) {
  switch (activity) {

    case "restaurant":
      return `<path d="M1 1h8v2H1zm0 4h8v2H1z" fill="#333"/>`

    case "wine":
      return `<path d="M5 1c2 0 3 2 3 3s-1 3-3 3-3-2-3-3 1-3 3-3zm-1 6h2v3H4z" fill="#333"/>`

    case "spa":
      return `<path d="M1 6c2-3 6-3 8 0" stroke="#333" stroke-width="2" fill="none"/>`

    case "horse":
      return `<path d="M1 7l4-5 4 5" stroke="#333" stroke-width="2" fill="none"/>`

    case "mountain":
      return `<path d="M1 8l4-6 4 6" stroke="#333" stroke-width="2" fill="none"/>`

    case "swim":
      return `<path d="M1 7c2 2 6 2 8 0" stroke="#333" stroke-width="2" fill="none"/>`

    case "art":
      return `<circle cx="5" cy="5" r="3" fill="#333"/>`

    case "hotel":
      return `<rect x="2" y="3" width="7" height="5" fill="#333"/>`

    case "nature":
      return `<path d="M5 1l4 8H1z" fill="#333"/>`

    case "cooking":
      return `<rect x="2" y="3" width="7" height="4" fill="#333"/>`

    default:
      return `<circle cx="5" cy="5" r="3" fill="#333"/>`
  }
}
