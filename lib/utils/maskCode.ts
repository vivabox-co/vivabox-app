const CODE_PREFIX = "VIVA-"

// Repère visuel pour les emails de confirmation : masque le milieu du code
// (2 premiers + 2 derniers caractères visibles, "VIVA-NW••-••K8") plutôt que
// de réafficher le code complet en clair dans une boîte mail — l'utilisateur
// vient de le saisir lui-même, il n'a pas besoin qu'on le lui réexpose en
// entier. Prend un code déjà normalisé (voir normalizeCode.ts), ex.
// "VIVANWFGA4K8".
export function maskCode(normalized: string): string {
  const suffix = normalized
    .toUpperCase()
    .replace(/^VIVA/, "")
    .slice(0, 8)

  if (suffix.length < 8) return CODE_PREFIX + suffix

  const masked = `${suffix.slice(0, 2)}••••${suffix.slice(6)}`
  const parts = masked.match(/.{1,4}/g) || []
  return CODE_PREFIX + parts.join("-")
}
