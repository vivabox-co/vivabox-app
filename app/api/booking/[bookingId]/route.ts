import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from "@/lib/services/supabase"
import { hashSessionToken } from "@/lib/utils/sessionToken"
import { MOMENT_LABEL } from "@/lib/utils/moment"
import type { Experience } from "@/lib/data/types"

// bookings.status (Supabase) → BookingStatus attendu par le front
// (components/ui/BookingTimeline.tsx). "waiting_provider" n'a pas
// d'équivalent dans le schéma Supabase actuel — jamais renvoyé pour l'instant.
const STATUS_MAP: Record<string, string> = {
  requested: "requested",
  alternative_proposed: "alternative_proposed",
  confirmed: "confirmed",
  completed: "done",
  cancelled: "rejected",
  // "cancelled_seen" (booking déjà refusé, écarté par le bénéficiaire — voir
  // respond-alternative) n'est normalement plus accessible : le middleware
  // redirige loin de /reservar/seguimiento dès que estado repasse à
  // "Activada". Mappé au même rendu que "cancelled" par prudence seulement,
  // au cas où cette page serait encore montée pendant la redirection.
  cancelled_seen: "rejected",
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
      .select("id, activation_code_id, experience_code, requested_date, message, status, created_at, proposed_date, proposed_moment, proposed_hour")
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
    // image vide par défaut (pas de placeholder codé en dur) : si aucun match
    // n'est trouvé, le front garde la photo déjà affichée (selectedExperience)
    // au lieu de l'écraser par un chemin qui peut ne pas exister.
    let experienceSnapshot = {
      id: booking.experience_code,
      title: "",
      image: "",
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

    const proposedMomentLabel = booking.proposed_moment ? (MOMENT_LABEL[booking.proposed_moment] ?? booking.proposed_moment) : null

    return NextResponse.json({
      success: true,
      data: {
        id: booking.id,
        experienceId: booking.experience_code,
        date: booking.requested_date ?? "",
        time: timeMatch ? timeMatch[1].trim() : "",
        status: STATUS_MAP[booking.status] ?? booking.status,
        createdAt: booking.created_at,
        proposedDate: booking.proposed_date ?? null,
        proposedMoment: proposedMomentLabel,
        proposedHour: booking.proposed_hour ?? null,
        experienceSnapshot,
      },
    });

  } catch (error) {
    console.error("BOOKING GET ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}

// Annulation réservée à l'équipe Vivabox : protégée par ADMIN_API_KEY (secret
// interne, distinct du vb_session client) plutôt que par la session du
// client qui a fait la réservation — un client ne doit jamais pouvoir
// annuler sa propre réservation depuis l'app.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { bookingId } = await params;
    const body = await req.json().catch(() => ({}));

    // Seule transition supportée pour l'instant : annulation. On valide
    // explicitement plutôt que d'accepter n'importe quel statut en écriture libre.
    if (body.status !== "cancelled") {
      return NextResponse.json({ success: false, error: "INVALID_STATUS" }, { status: 400 });
    }

    const supabase = getSupabase()

    const { data: booking, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .select("id, status")
      .maybeSingle()

    if (error) {
      console.error("BOOKING CANCEL ERROR:", error)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
    }

    if (!booking) {
      return NextResponse.json({ success: false, error: "BOOKING_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking });

  } catch (error) {
    console.error("BOOKING CANCEL ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
