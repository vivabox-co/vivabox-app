// Même numéro que le site vitrine (Web Site\vivabox,
// src/services/manualPayment.ts) — pas de "+" ni d'espaces, format attendu
// par l'URL wa.me.
export const WHATSAPP_NUMBER = "573142590291"

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
