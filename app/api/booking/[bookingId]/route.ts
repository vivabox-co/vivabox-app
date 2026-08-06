import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from "@/lib/services/supabase"
import { hashSessionToken } from "@/lib/utils/sessionToken"
import type { Experience } from "@/lib/data/types"

// bookings.status (Supabase) → BookingStatus attendu par le front
// (components/ui/BookingTimeline.tsx). "waiting_provider" n'a pas
// d'équivalent dans le schéma Supabase actuel — jamais renvoyé pour l'instant.
const STATUS_MAP: Record<string, string> = {
  requested: "requested",
  confirmed: "confirmed",
  completed: "done",
  cancelled: "rejected",
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
                  || req.cookies.get('vb_session')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "NO_SESSION" }, { status: 401 });
    }

    const supabase = getSupabase()

    const { data: session, error: sessionError } = await supabase
      .from("activation_sessions")
      .select("activation_code_id, expires_at, revoked_at")
      .eq("token_hash", hashSessionToken(token))
      .maybeSingle()

    if (sessionError) {
      console.error("BOOKING GET SESSION ERROR:", sessionError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    if (!session || session.revoked_at || new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "INVALID_SESSION" });
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, activation_code_id, experience_code, requested_date, message, status")
      .eq("id", bookingId)
      .maybeSingle()

    if (bookingError) {
      console.error("BOOKING GET ERROR:", bookingError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    // La réservation doit appartenir à la session qui la demande.
    if (!booking || booking.activation_code_id !== session.activation_code_id) {
      return NextResponse.json({ success: false, error: "BOOKING_NOT_FOUND" });
    }

    // Le catalogue d'expériences reste sur Google Sheets (pas de FK possible
    // côté Supabase) — on va chercher le snapshot via la route existante.
    let experienceSnapshot = {
      id: booking.experience_code,
      title: "",
      image: "/images/placeholder.jpg",
      zone: "",
      category: "",
      providerName: "",
    }

    try {
      const experiencesUrl = new URL("/api/experiencias", req.url)
      const experiencesRes = await fetch(experiencesUrl, { cache: "no-store" })
      const experiencesData = await experiencesRes.json()
      const experiences: Experience[] = experiencesData?.data ?? []
      const match = experiences.find((e) => e.id === booking.experience_code)
      if (match) {
        experienceSnapshot = {
          id: match.id,
          title: match.title,
          image: match.image,
          zone: match.zone,
          category: match.category,
          providerName: match.providerName,
        }
      }
    } catch (snapshotError) {
      console.error("BOOKING GET EXPERIENCE SNAPSHOT ERROR:", snapshotError)
    }

    // Le créneau horaire est replié dans `message` à la création (pas de
    // colonne dédiée dans le schéma partagé) — on l'en extrait ici.
    const timeMatch = booking.message?.match(/Horario:\s*([^·]+)/)

    return NextResponse.json({
      success: true,
      data: {
        id: booking.id,
        experienceId: booking.experience_code,
        date: booking.requested_date ?? "",
        time: timeMatch ? timeMatch[1].trim() : "",
        status: STATUS_MAP[booking.status] ?? booking.status,
        experienceSnapshot,
      },
    });

  } catch (error) {
    console.error("BOOKING GET ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
