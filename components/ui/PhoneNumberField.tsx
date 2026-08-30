"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Search, X } from "lucide-react"
import {
  DEFAULT_COUNTRY,
  formatAsYouType,
  getCountryOptions,
  getNationalPlaceholder,
  isValidNationalNumber,
  toE164,
  type CountryCode,
  type CountryOption,
} from "@/lib/utils/phoneNumber"

type Props = {
  onChange: (e164: string, valid: boolean) => void
}

export default function PhoneNumberField({ onChange }: Props) {
  const countries = useMemo(() => getCountryOptions(), [])
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY)
  const [national, setNational] = useState("")
  const [pickerOpen, setPickerOpen] = useState(false)

  const current = countries.find(c => c.code === country) ?? countries[0]
  const valid = isValidNationalNumber(national, country)
  const showError = national.length > 0 && !valid

  function handleNationalChange(raw: string) {
    const formatted = formatAsYouType(raw, country)
    setNational(formatted)
    onChange(toE164(formatted, country), isValidNationalNumber(formatted, country))
  }

  function handleSelectCountry(next: CountryOption) {
    setCountry(next.code)
    // On garde ce que la personne a déjà tapé : on le reformate simplement
    // pour le nouveau pays plutôt que de vider le champ.
    const digitsOnly = national.replace(/\D/g, "")
    const reformatted = digitsOnly ? formatAsYouType(digitsOnly, next.code) : ""
    setNational(reformatted)
    onChange(toE164(reformatted, next.code), isValidNationalNumber(reformatted, next.code))
    setPickerOpen(false)
  }

  return (
    <div>
      <div style={phoneRow}>
        <button type="button" onClick={() => setPickerOpen(true)} style={countryBtn}>
          <span style={flagStyle}>{current.flag}</span>
          <span>+{current.callingCode}</span>
          <ChevronDown size={14} style={{ opacity: 0.6 }} />
        </button>
        <input
          value={national}
          onChange={e => handleNationalChange(e.target.value)}
          placeholder={getNationalPlaceholder(country)}
          type="tel"
          inputMode="tel"
          style={numberInput}
        />
      </div>

      {showError && <p style={errorHint}>Ingresa un número válido.</p>}

      {pickerOpen && (
        <CountryPickerModal
          countries={countries}
          selected={country}
          onSelect={handleSelectCountry}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}

function CountryPickerModal({
  countries,
  selected,
  onSelect,
  onClose,
}: {
  countries: CountryOption[]
  selected: CountryCode
  onSelect: (country: CountryOption) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return countries
    const qDigits = q.replace(/\D/g, "")
    return countries.filter(c =>
      c.name.toLowerCase().includes(q) || (qDigits && c.callingCode.includes(qDigits))
    )
  }, [countries, query])

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <div style={modalHeader}>
          <span style={modalTitle}>Elige tu país</span>
          <button onClick={onClose} style={closeBtn} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div style={searchWrap}>
          <Search size={15} style={{ opacity: 0.4, flexShrink: 0 }} />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar país o indicativo"
            style={searchInput}
          />
        </div>

        <div style={listWrap}>
          {filtered.length === 0 ? (
            <p style={emptyHint}>No encontramos ese país.</p>
          ) : (
            filtered.map(c => (
              <button
                key={c.code}
                onClick={() => onSelect(c)}
                style={{ ...countryRow, ...(c.code === selected ? countryRowActive : {}) }}
              >
                <span style={flagStyle}>{c.flag}</span>
                <span style={countryName}>{c.name}</span>
                <span style={countryCode}>+{c.callingCode}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- STYLES ---------- */

const phoneRow: React.CSSProperties = { display: "flex", gap: 8 }

const countryBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "12px 10px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  fontSize: 15,
  fontWeight: 600,
  color: "#152F40",
  cursor: "pointer",
  flexShrink: 0,
}

const flagStyle: React.CSSProperties = { fontSize: 17, lineHeight: 1 }

const numberInput: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  fontSize: 15,
  boxSizing: "border-box",
}

const errorHint: React.CSSProperties = { margin: "8px 0 0", fontSize: 12.5, color: "#B42318" }

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.25)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  zIndex: 2000,
}

const modal: React.CSSProperties = {
  width: "100%",
  maxWidth: 500,
  maxHeight: "70vh",
  background: "#fff",
  borderRadius: "28px 28px 0 0",
  padding: "18px 20px",
  display: "flex",
  flexDirection: "column",
}

const modalHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
  flexShrink: 0,
}

const modalTitle: React.CSSProperties = { fontSize: 17, fontWeight: 700, color: "#152F40" }

const closeBtn: React.CSSProperties = {
  background: "#F3F3F3",
  border: "none",
  width: 30,
  height: 30,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#555",
}

const searchWrap: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  marginBottom: 10,
  flexShrink: 0,
}

const searchInput: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: "none",
  outline: "none",
  fontSize: 15,
}

const listWrap: React.CSSProperties = {
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  display: "flex",
  flexDirection: "column",
  gap: 2,
}

const emptyHint: React.CSSProperties = { fontSize: 13.5, color: "#999", padding: "12px 4px" }

const countryRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "11px 8px",
  borderRadius: 10,
  border: "none",
  background: "transparent",
  textAlign: "left",
  cursor: "pointer",
}

const countryRowActive: React.CSSProperties = { background: "#F3F1EC" }

const countryName: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  fontSize: 14.5,
  color: "#152F40",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}

const countryCode: React.CSSProperties = { fontSize: 13.5, color: "#888", fontWeight: 600, flexShrink: 0 }
