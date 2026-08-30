import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min"
import examples from "libphonenumber-js/examples.mobile.json"

export type CountryOption = {
  code: CountryCode
  name: string
  callingCode: string
  flag: string
}

export const DEFAULT_COUNTRY: CountryCode = "CO"

// Regional indicator letters Unicode : chaque lettre A-Z d'un code ISO
// alpha-2 se mappe sur un symbole indicateur régional, dont la paire forme
// l'emoji drapeau du pays — pas de liste de drapeaux à maintenir à la main.
function flagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)))
}

let cachedCountryOptions: CountryOption[] | null = null

// Liste dérivée entièrement de libphonenumber-js (indicatifs) + Intl.DisplayNames
// (noms localisés) : aucun pays/indicatif saisi à la main, voir consigne AGENTS.
export function getCountryOptions(): CountryOption[] {
  if (cachedCountryOptions) return cachedCountryOptions

  const displayNames = new Intl.DisplayNames(["es"], { type: "region" })

  cachedCountryOptions = getCountries()
    .map(code => ({
      code,
      name: displayNames.of(code) ?? code,
      callingCode: getCountryCallingCode(code),
      flag: flagEmoji(code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"))

  return cachedCountryOptions
}

export function getNationalPlaceholder(country: CountryCode): string {
  const example = getExampleNumber(country, examples)
  return example ? example.formatNational() : ""
}

// Reformate les chiffres déjà saisis pour le nouveau pays choisi (on ne vide
// jamais le champ au changement de pays, voir test #4 de la demande).
export function formatAsYouType(national: string, country: CountryCode): string {
  return new AsYouType(country).input(national)
}

export function isValidNationalNumber(national: string, country: CountryCode): boolean {
  if (!national.trim()) return false
  return isValidPhoneNumber(national, country)
}

// Renvoie le numéro au format E.164 (ex. +573001234567) si valide, sinon "".
export function toE164(national: string, country: CountryCode): string {
  if (!isValidNationalNumber(national, country)) return ""
  const parsed = parsePhoneNumberFromString(national, country)
  return parsed?.number ?? ""
}

export type { CountryCode }
