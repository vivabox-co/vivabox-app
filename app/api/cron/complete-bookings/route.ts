import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from "@/lib/services/supabase"

// Rien ne faisait jamais passer une réservation confirmée à "completed" —
// ça restait un statut purement manuel (édité à la main dans Supabase), donc
// la timeline se figeait sur "confirmé" pour toujours et le flux d'avis
// (voir /api/booking/[bookingId]/review) ne se déclenchait jamais tout seul.
// Déclenché quotidiennement par vercel.json (crons) ; protégé par CRON_SECRET,
// que Vercel envoie automatiquement en "Authorization: Bearer <secret>" pour
// les requêtes cron — à définir dans les variables d'env du projet Vercel.
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const supabase = getSupabase()

    // Date du jour à Bogotá (pas UTC) : une réservation dont le jour est
    // passé localement ne doit pas attendre le changement de date UTC.
    const todayBogota = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" })

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "completed" })
      .eq("status", "confirmed")
      .lt("requested_date", todayBogota)
      .select("id")

    if (error) {
      console.error("CRON COMPLETE BOOKINGS ERROR:", error)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ success: true, completed: data?.length ?? 0 });

  } catch (error) {
    console.error("CRON COMPLETE BOOKINGS ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
