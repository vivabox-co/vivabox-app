import { Resend } from "resend"

// Même pattern que le site vitrine (Web Site\vivabox, src/services/email.ts)
// et vivabox-operativo (src/services/email.ts) : un client Resend par
// process, jamais recréé à chaque envoi.
let client: Resend | null = null

export function getResend(): Resend {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY!)
  }
  return client
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
