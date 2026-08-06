import { NextResponse } from 'next/server';

// Cache en mémoire (5 minutes)
let cachedExperiences: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  try {
    // Vérifier le cache
    if (cachedExperiences && (Date.now() - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json(cachedExperiences);
    }

    // Appel vers Apps Script - action dédiée "get_experiencias"
    const response = await fetch(process.env.GAS_API_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_experiencias',
        payload: {}
      })
    });

    const data = await response.json();
    if (data.success) {
      cachedExperiences = data.data;
      cacheTimestamp = Date.now();
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}