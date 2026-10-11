// Catalogue d'expériences lu depuis Supabase (tables experiences + providers),
// restitué sous la MÊME forme que les lignes du CSV publié du Sheet maître:
// Record<string,string> avec les en-têtes espagnols. Le code existant des
// consommateurs (translateRow / mapRow / filtres estado) ne change donc pas.
//
// Source canonique: VivaBox_Portal/src/lib/catalog.ts. Copiée telle quelle dans
//   - Web Site/vivabox/src/services/catalog.ts        (profile "public")
//   - Web_App_Ben/vivabox-appben/lib/services/catalog.ts (profile "public")
//   - App_Operativo/vivabox-operativo/src/services/catalog.ts (profile "operativo")
// Serveur uniquement (clé service_role): ne jamais importer côté navigateur.
//
// Principe de moindre privilège: on ne SÉLECTIONNE que les colonnes autorisées
// pour le profil. Le profil "public" ne reçoit jamais tarifa_neta_vivabox, ni
// l'e-mail/contact des prestataires, ni documento_anexo_url (comptes bancaires).

import type { SupabaseClient } from '@supabase/supabase-js'

export type CatalogRow = Record<string, string>
export type CatalogProfile = 'public' | 'operativo'

export const PUBLISHED_ESTADO = 'listo para publicar'

// Colonnes de `experiences` qui portent le même nom que l'en-tête du Sheet.
const PUBLIC_COLUMNS = [
  'codigo_interno',
  'nombre_experiencia',
  'categoria',
  'tipo_actividad',
  'ciudad',
  'zona',
  'ubicacion_lat',
  'ubicacion_lng',
  'proveedor_direccion',
  'duracion_min',
  'tipo_duracion',
  'formato',
  'descripcion_corta',
  'nota_vivabox',
  'incluye',
  'actividades_extra',
  'requisitos',
  'ideal_para',
  'nivel_esfuerzo',
  'nota_clima',
  'nota_vestimenta',
  'info_importante',
  'ambiente_animo',
  'entorno',
  'ritmo',
  'imagen',
  'imagenes_adicionales',
  'claves_eleccion',
  'tipo_calma', // moteur de recommandation (appben)
  'tipo_participacion',
  'tipo_sacudida',
  'resolucion',
  'requiere_telefono',
  'requiere_num_personas',
  'permite_extra',
  'max_personas_extra',
  'extra_requiere_aprobacion',
  'nota_extra',
  'estado',
] as const

const OPERATIVO_COLUMNS = [
  'codigo_interno',
  'nombre_experiencia',
  'ciudad',
  'formato',
  'estado',
  'tarifa_neta_vivabox', // CONFIDENTIEL
  'saldo_cuando_pagar',
] as const

// providers.<champ> -> en-tête du Sheet
const PUBLIC_PROVIDER: Record<string, string> = {
  name: 'proveedor_nombre',
  phone: 'proveedor_telefono',
  instagram: 'proveedor_instagram',
}
const OPERATIVO_PROVIDER: Record<string, string> = {
  name: 'proveedor_nombre',
  contact: 'proveedor_contacto',
  phone: 'proveedor_telefono',
  email: 'proveedor_email',
}

// duracion_min est stocké en minutes (entier); le Sheet l'écrit "H:MM".
function minutesToHm(min: number): string {
  return `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`
}

function toCell(key: string, v: unknown): string {
  if (v === null || v === undefined) return ''
  if (key === 'duracion_min' && typeof v === 'number') return minutesToHm(v)
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
  return String(v)
}

type RawRow = Record<string, unknown> & { providers?: Record<string, unknown> | null }

export function toCatalogRow(raw: RawRow, profile: CatalogProfile): CatalogRow {
  const columns = profile === 'operativo' ? OPERATIVO_COLUMNS : PUBLIC_COLUMNS
  const providerMap = profile === 'operativo' ? OPERATIVO_PROVIDER : PUBLIC_PROVIDER
  const row: CatalogRow = {}
  for (const c of columns) row[c] = toCell(c, raw[c])
  for (const [field, header] of Object.entries(providerMap)) row[header] = toCell(header, raw.providers?.[field])
  return row
}

export async function fetchCatalogRows(sb: SupabaseClient, profile: CatalogProfile): Promise<CatalogRow[]> {
  const columns = profile === 'operativo' ? OPERATIVO_COLUMNS : PUBLIC_COLUMNS
  const providerMap = profile === 'operativo' ? OPERATIVO_PROVIDER : PUBLIC_PROVIDER
  const select = `${columns.join(',')},providers(${Object.keys(providerMap).join(',')})`

  const { data, error } = await sb
    .from('experiences')
    .select(select)
    .eq('estado', PUBLISHED_ESTADO)
    .order('codigo_interno')
  if (error) throw new Error(`catalog: ${error.message}`)
  return ((data ?? []) as unknown as RawRow[]).map((r) => toCatalogRow(r, profile))
}
