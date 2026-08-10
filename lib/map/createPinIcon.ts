/* ⚠️ IMPORTANT : ne PAS importer Leaflet en haut */
import { getActivityIcon } from "./getActivityIcon"

export function createPinIcon(
  categoryColor: string,
  activityKey: string,
  isFavorite: boolean,
  title?: string
) {
  /* 🧠 Empêche exécution côté serveur */
  if (typeof window === "undefined") return undefined as any

  const L = require("leaflet") // ← import dynamique côté client uniquement
  const iconSrc = getActivityIcon(activityKey)

  return L.divIcon({
    className: "vivabox-pin",
    html: `
      <div style="position: relative; width: 44px; height: 44px;">
        <div role="img" aria-label="${(title || "").replace(/"/g, "&quot;")}" style="
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
            alt=""
            style="
              transform: rotate(45deg);
              position:relative;
              z-index:2;
              pointer-events:none;
              filter: brightness(0) invert(1);
            "
          />
        </div>

        ${
          isFavorite
            ? `<div style="
                position:absolute;
                top:-4px;
                right:-4px;
                width:20px;
                height:20px;
                background:#fff;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
                box-shadow:0 2px 6px rgba(0,0,0,0.3);
                pointer-events:none;
              ">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff4d6d" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </div>`
            : ""
        }
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -40],
  })
}
