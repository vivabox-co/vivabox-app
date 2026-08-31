import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from "@/lib/services/supabase"
import { hashSessionToken } from "@/lib/utils/sessionToken"
import { MOMENT_LABEL } from "@/lib/utils/moment"
import { formatApproxHour } from "@/lib/utils/formatApproxHour"
import type { Experience } from "@/lib/data/types"

// bookings.status (Supabase) → BookingStatus attendu par le front
// (components/ui/BookingTimeline.tsx). "waiting_provider" et
// "searching_alternative" n'ont pas d'équivalent dans le schéma Supabase
// actuel — ce sont des états dérivés côté front/API (voir plus bas), jamais
// écrits tels quels en base.
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
      .select("id, activation_code_id, experience_code, requested_date, requested_dates, message, status, created_at, proposed_date, proposed_moment, proposed_hour, tracking_first_seen_at")
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
    // colonne dédiée dans le schéma partagé) — on l'en extrait ici. L'heure
    // saisie par l'équipe y est en "(~HH:MM)" (voir /reservar/fechas) : jamais
    // exacte, donc reformulée en "alrededor de las" + heure arrondie plutôt
    // que montrée telle quelle (ex: "07:39").
    const timeMatch = booking.message?.match(/Horario:\s*([^·]+)/)
    const rawTime = timeMatch ? timeMatch[1].trim() : ""
    const rawHourMatch = rawTime.match(/\(~(\d{1,2}:\d{2})\)/)
    const displayTime = rawHourMatch
      ? `${rawTime.replace(/\s*\(~\d{1,2}:\d{2}\)/, "").trim()} · alrededor de las ${formatApproxHour(rawHourMatch[1])}`
      : rawTime

    const proposedMomentLabel = booking.proposed_moment ? (MOMENT_LABEL[booking.proposed_moment] ?? booking.proposed_moment) : null

    // Trace de chaque reprogrammation faite depuis /ayuda (voir POST
    // .../reschedule) — table dédiée plutôt qu'un champ unique sur bookings
    // pour garder tout l'historique si le bénéficiaire change plusieurs fois,
    // pas juste la dernière valeur écrasée.
    const { data: rescheduleRows, error: rescheduleHistoryError } = await supabase
      .from("booking_reschedules")
      .select("previous_date, previous_time_label, new_date, new_time_label, changed_at")
      .eq("booking_id", bookingId)
      .order("changed_at", { ascending: true })

    if (rescheduleHistoryError) {
      console.error("BOOKING GET RESCHEDULE HISTORY ERROR:", rescheduleHistoryError)
    }

    // 1ère fois que /reservar/seguimiento (seul appelant qui passe ?track=1,
    // voir plus bas) voit la réservation en "requested" : on fige l'instant
    // côté serveur (au lieu d'un simple minuteur front qui redémarrerait à
    // chaque remontage) pour que la mise en scène "Disponibilidad con el
    // lugar" se déclenche au même instant réel, que le bénéficiaire reste sur
    // la page ou navigue ailleurs et revienne. Sans ce filtre, l'écran de
    // confirmation (/reservar/fechas/confirmacion) — qui appelle aussi ce GET
    // pour récupérer juste l'image — démarrait l'horloge avant même que le
    // bénéficiaire ait cliqué "Ver seguimiento", donc l'étape apparaissait
    // déjà validée en arrivant sur /reservar/seguimiento. Filtre .is(...)
    // pour ne jamais écraser une valeur déjà posée par un appel concurrent ;
    // si ce filtre fait échouer notre propre UPDATE (l'autre appel a gagné la
    // course), on relit la valeur qu'il a posée plutôt que de garder la nôtre.
    const track = req.nextUrl.searchParams.get("track") === "1"
    let requestedSeenAt: string | null = booking.tracking_first_seen_at
    if (track && booking.status === "requested" && !requestedSeenAt) {
      const seenAt = new Date().toISOString()
      const { data: updated, error: seenError } = await supabase
        .from("bookings")
        .update({ tracking_first_seen_at: seenAt })
        .eq("id", bookingId)
        .is("tracking_first_seen_at", null)
        .select("tracking_first_seen_at")
        .maybeSingle()

      if (seenError) {
        console.error("BOOKING GET SEEN_AT ERROR:", seenError)
        requestedSeenAt = seenAt
      } else if (updated) {
        requestedSeenAt = updated.tracking_first_seen_at
      } else {
        const { data: refetched } = await supabase
          .from("bookings")
          .select("tracking_first_seen_at")
          .eq("id", bookingId)
          .maybeSingle()
        requestedSeenAt = refetched?.tracking_first_seen_at ?? seenAt
      }
    }

    // Une réservation reste "requested" en base tant que l'équipe n'a rien
    // tranché — mais si TOUTES les préférences classées (P1/P2/P3) sont déjà
    // passées sans confirmation, il ne s'agit plus d'une simple attente de
    // réponse du lugar : on est en recherche d'une alternative. Dérivé ici
    // (jamais écrit en base) pour ne pas dépendre d'un nouveau statut côté
    // panneau admin (site vitrine, autre repo) — le dossier de réservation
    // reste le même, seul l'affichage change (voir seguimiento/[bookingId]).
    let derivedStatus = STATUS_MAP[booking.status] ?? booking.status
    if (booking.status === "requested") {
      const todayBogota = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" })
      const datesToCheck = (booking.requested_dates as string[] | null)?.length
        ? (booking.requested_dates as string[])
        : booking.requested_date ? [booking.requested_date] : []
      const allPast = datesToCheck.length > 0 && datesToCheck.every((d) => d < todayBogota)
      if (allPast) derivedStatus = "searching_alternative"
    }

    return NextResponse.json({
      success: true,
      data: {
        id: booking.id,
        experienceId: booking.experience_code,
        date: booking.requested_date ?? "",
        time: displayTime,
        status: derivedStatus,
        createdAt: booking.created_at,
        requestedSeenAt,
        requestedDates: booking.requested_dates ?? null,
        proposedDate: booking.proposed_date ?? null,
        proposedMoment: proposedMomentLabel,
        proposedHour: booking.proposed_hour ?? null,
        rescheduleHistory: (rescheduleRows ?? []).map((r) => ({
          previousDate: r.previous_date,
          previousTimeLabel: r.previous_time_label,
          newDate: r.new_date,
          newTimeLabel: r.new_time_label,
          changedAt: r.changed_at,
        })),
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
