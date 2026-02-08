import { ActivityKey } from "@/lib/data/types"

export type ActivityGroup = {
  id: string
  label: string
  icon: string
  keys: ActivityKey[]
}

/**
 * Mapping PRODUIT
 * activity_key (sheet) → idée mentale utilisateur
 */
export const ACTIVITY_GROUPS: ActivityGroup[] = [
  {
    id: "cabalgata",
    label: "Cabalgata",
    icon: "horseback",
    keys: ["horseback"],
  },
  {
    id: "spa",
    label: "Spa & bienestar",
    icon: "spa",
    keys: ["spa", "massage", "sauna", "facial", "meditation", "ice_bath"],
  },
  {
    id: "cena",
    label: "Cena especial",
    icon: "dining",
    keys: ["dining", "brunch", "sushi_class", "pizza_class", "bbq", "chef-hat"],
  },
  {
    id: "noche",
    label: "Noche especial",
    icon: "hotel_stay",
    keys: ["hotel_stay", "glamping", "eco_lodge", "caravan"],
  },
  {
    id: "aventura_extrema",
    label: "Aventura extrema",
    icon: "paragliding",
    keys: ["paragliding", "bungee", "skydive", "wind_tunnel", "scuba"],
  },
  {
    id: "taller",
    label: "Taller creativo",
    icon: "art_workshop",
    keys: ["art_workshop", "perfume", "coffee_tasting", "beer_tasting", "photoshoot"],
  },
]
