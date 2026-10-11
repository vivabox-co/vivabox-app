import { NextResponse } from 'next/server'
import { recoFromRows } from '@/components/reco/recoDataset'
import { fetchCatalogRows } from '@/lib/services/catalog'
import { getSupabase } from '@/lib/services/supabase'

// Jeu de données du moteur de recommandation, lu depuis Supabase
// (experiences + providers) côté serveur. Le client (recoDataset.ts) se
// replie sur le CSV publié si cette route échoue.
export async function GET() {
  try {
    const rows = await fetchCatalogRows(getSupabase(), 'public')
    return NextResponse.json({ success: true, data: recoFromRows(rows) })
  } catch (error) {
    console.error('RECO DATASET GET ERROR:', error)
    return NextResponse.json({ success: false, error: 'SERVER_ERROR' }, { status: 500 })
  }
}
