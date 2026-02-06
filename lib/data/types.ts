export type Category =
  | "gastro"
  | "bienestar"
  | "aventura"
  | "cultura"
  | "estancias"

export type Format = "solo" | "duo" | "familia"

/**
 * activity_key correspond EXACTEMENT
 * aux fichiers SVG dans /public/icons
 * et à la colonne "activity_key" du Google Sheet
 */
export type ActivityKey =
  | "archery"
  | "art_workshop"
  | "bbq"
  | "beer_tasting"
  | "brunch"
  | "buggy"
  | "bungee"
  | "caravan"
  | "chef-hat"
  | "cinema"
  | "climbing"
  | "coffee_tasting"
  | "dining"
  | "driving_track"
  | "eco_lodge"
  | "escape_room"
  | "facial"
  | "flight_plane"
  | "glass"
  | "glamping"
  | "golf"
  | "hair"
  | "hiking"
  | "horseback"
  | "hotel_stay"
  | "ice_bath"
  | "karting"
  | "massage"
  | "meditation"
  | "motorbike"
  | "paragliding"
  | "perfume"
  | "photoshoot"
  | "pizza_class"
  | "sauna"
  | "scuba"
  | "skydive"
  | "spa"
  | "sushi_class"
  | "theater"
  | "wind_tunnel"

export type Experience = {
  id: string
  title: string

  /** Sous-titre utilisé dans liste & seguimiento */
  subtitle?: string

  category: Category
  activity_key: ActivityKey

  /** Position carte */
  lat: number
  lng: number

  /** Infos affichées dans card */
  zone: string
  distance: string
  duration: string
  format: Format

  /** Image card */
  image: string

  /** Note interne UX (phrase courte affichée parfois) */
  vivanote: string
}
