import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { codigo } = await req.json();
    if (!codigo) {
      return NextResponse.json({ success: false, error: "CODIGO_REQUIRED" }, { status: 400 });
    }

    // Appel vers Google Apps Script
    const response = await fetch(process.env.GAS_API_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_codigo_context',
        payload: { codigo }
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/codigo/context:', error);
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}