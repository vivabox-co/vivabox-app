/* ⚠️ IMPORTANT : ne PAS importer Leaflet en haut */
import { getActivityIcon } from "./getActivityIcon"

export function createPinIcon(
  categoryColor: string,
  activityKey: string,
  isFavorite: boolean
) {
  /* 🧠 Empêche exécution côté serveur */
  if (typeof window === "undefined") return undefined as any

  const L = require("leaflet") // ← import dynamique côté client uniquement
  const iconSrc = getActivityIcon(activityKey)

  return L.divIcon({
    className: "vivabox-pin",
    html: `
      <div style="
        position: relative;
        width: 44px;
        height: 44px;
        background: ${categoryColor};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 14px rgba(0,0,0,0.25);
      ">

        <!-- pictogramme -->
        <img 
          src="${iconSrc}" 
          width="22" 
          height="22"
          style="
            transform: rotate(45deg);
            position:relative;
            z-index:2;
            pointer-events:none;
            filter: brightness(0) invert(1);
          "
        />

        ${
          isFavorite
            ? `<div style="
                position:absolute;
                width:52px;
                height:52px;
                border:3px solid gold;
                border-radius:50%;
                top:-4px;
                left:-4px;
                transform: rotate(45deg);
                pointer-events:none;
              "></div>`
            : ""
        }
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -40],
  })
}
