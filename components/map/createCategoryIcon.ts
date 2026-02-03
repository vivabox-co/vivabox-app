import L from "leaflet";
import { categoryColors } from "./categoryColors";

export function createCategoryIcon(category: string) {
  const color = categoryColors[category] || "#111111";

  const svg = `
    <svg width="32" height="44" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 0C5.372 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.628 0 12 0z"
        fill="${color}"
      />
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -40],
  });
}
