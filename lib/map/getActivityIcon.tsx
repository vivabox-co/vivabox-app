const iconBasePath = "/icons"

export const defaultActivityIcon = `${iconBasePath}/dining.svg`

/**
 * Clés autorisées = sécurité produit
 */
const VALID_ACTIVITY_KEYS = new Set([
  "archery",
  "art_workshop",
  "bbq",
  "beer_tasting",
  "brunch",
  "buggy",
  "bungee",
  "caravan",
  "chef_hat",
  "cinema",
  "climbing",
  "coffee_tasting",
  "dining",
  "driving_track",
  "eco_lodge",
  "escape_room",
  "facial",
  "flight_plane",
  "glass",
  "glamping",
  "golf",
  "hair",
  "hiking",
  "horseback",
  "hotel_stay",
  "ice_bath",
  "karting",
  "massage",
  "meditation",
  "motorbike",
  "paragliding",
  "perfume",
  "photoshoot",
  "pizza_class",
  "sauna",
  "scuba",
  "skydiving",
  "spa",
  "sushi_class",
  "theater",
  "wind_tunnel",
])

/**
 * Nettoyage minimal SAFE
 */
function cleanKey(value: string): string {
  return value
    .replace(/\u00A0/g, "") // espace insécable Google
    .trim()
}

export function getActivityIcon(activityKey: string): string {
  if (!activityKey) return defaultActivityIcon

  const key = cleanKey(activityKey)

  if (!VALID_ACTIVITY_KEYS.has(key)) {
    console.warn("⚠️ activity_key inconnue :", key)
    return defaultActivityIcon
  }

  return `${iconBasePath}/${key}.svg`
}
