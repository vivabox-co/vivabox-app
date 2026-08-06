import { ActivityKey } from "@/lib/data/types"

// Traduction des activity_key (venant du Google Sheet, en anglais/slug) vers
// des libellés espagnols affichables. Liste construite à partir du catalogue
// réel (231 lignes, 5 catégories) — voir lib/data/fetchExperiences.ts pour la
// source. Une clé absente d'ici retombe sur un fallback lisible (underscore
// -> espace, capitalisée) plutôt que de planter.
const ACTIVITY_LABELS: Record<string, string> = {
  // aventura
  archery: "Tiro con arco",
  buggy: "Buggy",
  bungee: "Bungee jumping",
  climbing: "Escalada",
  driving_track: "Pista de manejo",
  escape_room: "Escape room",
  flight_plane: "Vuelo en avioneta",
  golf: "Golf",
  hiking: "Senderismo",
  horseback: "Cabalgata",
  karting: "Karting",
  motorbike: "Moto",
  paragliding: "Parapente",
  scuba: "Buceo",
  skydiving: "Salto en paracaídas",
  wind_tunnel: "Túnel de viento",

  // gastro
  bbq: "Parrilla",
  beer_tasting: "Cata de cervezas",
  brunch: "Brunch",
  chef_hat: "Clase de cocina",
  coffee_tasting: "Cata de café",
  dining: "Cena",
  glass: "Cata de vinos",
  pizza_class: "Clase de pizza",
  sushi_class: "Clase de sushi",

  // bienestar
  facial: "Facial",
  hair: "Peluquería",
  ice_bath: "Baño de hielo",
  massage: "Masaje",
  meditation: "Meditación",
  sauna: "Sauna",
  spa: "Spa",

  // cultura
  art_workshop: "Taller de arte",
  cinema: "Cine",
  perfume: "Perfumería",
  photoshoot: "Sesión de fotos",
  theater: "Teatro",

  // estancias
  caravan: "Caravana",
  eco_lodge: "Eco-lodge",
  glamping: "Glamping",
  hotel_stay: "Estadía en hotel",
}

function fallbackLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function activityLabel(key: ActivityKey): string {
  return ACTIVITY_LABELS[key] ?? fallbackLabel(key)
}
