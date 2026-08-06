// Accepte les codes collés avec casse/espaces/tirets variables (ex: "viva-ab3d7",
// "VIVA AB3D7") et les normalise vers la même forme comparable.
export function normalizeCode(code: string): string {
  return String(code || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .trim()
}
