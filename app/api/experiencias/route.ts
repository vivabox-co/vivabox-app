import { NextResponse } from 'next/server';
import { fetchExperiencesFromSheet } from "@/lib/data/fetchExperiences"
import type { Experience } from "@/lib/data/types"

// Le catalogue vivait sur Apps Script (action "get_experiencias"), mais ce
// backend a été retiré côté script — l'action n'existe plus (INVALID_ACTION).
// Le catalogue vit maintenant directement dans le sheet publié en CSV (voir
// fetchExperiencesFromSheet), qui reste la même source que celle déjà
// utilisée en fallback côté client depuis la migration Supabase.
let cachedExperiences: Experience[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  try {
    if (cachedExperiences && (Date.now() - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json({ success: true, data: cachedExperiences });
    }

    const data = await fetchExperiencesFromSheet();
    cachedExperiences = data;
    cacheTimestamp = Date.now();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("EXPERIENCIAS GET ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
