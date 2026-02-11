export function generateId(): string {
  // Si le navigateur supporte randomUUID → utilise-le
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  // Sinon fallback universel (marche partout)
  return "id-" + Math.random().toString(36).slice(2) + Date.now()
}