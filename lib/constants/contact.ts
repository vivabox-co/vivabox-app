// Numéro d'assistance Vivabox (Mariana), utilisé pour tous les boutons
// "Hablar con Mariana" / "Escribir por WhatsApp" de l'app.
export const WHATSAPP_NUMBER = "573142590291"

export function getWhatsAppLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
