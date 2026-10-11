import { NextResponse } from 'next/server';
import { loadPublishedExperiences } from "@/lib/services/experienceCatalog"
import type { Experience } from "@/lib/data/types"

// Le catalogue est lu depuis Supabase (tables experiences + providers), avec
// le CSV publié du Sheet en repli — voir lib/services/experienceCatalog.ts.
let cachedExperiences: Experience[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  try {
    if (cachedExperiences && (Date.now() - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json({ success: true, data: cachedExperiences });
    }

    const data = await loadPublishedExperiences();
    cachedExperiences = data;
    cacheTimestamp = Date.now();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("EXPERIENCIAS GET ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
