// Accepte un numéro avec ou sans indicatif (+57...), espaces/tirets/parenthèses
// tolérés à la saisie — seule la forme normalisée (chiffres + "+" optionnel en
// tête) est validée, entre 8 et 15 chiffres (plage E.164 raisonnable).
export function isValidWhatsApp(value: string): boolean {
  const normalized = value.trim().replace(/[\s()-]/g, "")
  return /^\+?\d{8,15}$/.test(normalized)
}
