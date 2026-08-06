import { randomBytes, createHash } from "node:crypto"

// Le token brut n'est renvoyé qu'une fois, à l'appelant — seul son hash est
// persisté, pour qu'une lecture seule de activation_sessions ne permette
// jamais d'usurper une session.
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url")
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}
