export type Category =
  | "gastro"
  | "bienestar"
  | "aventura"
  | "cultura"
  | "estancias"

export type Format = "solo" | "duo"

/**
 * activity_key correspond EXACTEMENT
 * au nom des fichiers SVG dans /public/icons
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
  category: Category
  activity_key: ActivityKey   // ✅ maintenant aligné avec tes SVG
  lat: number
  lng: number
  duration: string
  format: Format
  zone: string
  distance: string
  image: string
  vivanote: string
}
