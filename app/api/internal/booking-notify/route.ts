import { createHash, timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/services/supabase"
import { sendBeneficiaryBookingEmail, type BookingEmailKind } from "@/lib/services/beneficiaryEmail"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// "booking_received" n'est pas exposé : il part de POST /api/booking
// lui-même, ici tout de suite après l'insertion — jamais depuis l'extérieur.
const ALLOWED_KINDS = ["confirmed", "alternative_proposed", "dates_unavailable"] as const

function hasValidSecret(req: NextRequest) {
  const expected = process.env.INTERNAL_API_SECRET
  const received = req.headers.get("x-internal-secret")

  if (!expected || !received) return false

  // Comparaison sur des hashes de longueur fixe (timingSafeEqual lève si les
  // deux buffers n'ont pas la même taille) — même garde que
  // /api/internal/buyer-email côté site vitrine.
  const a = createHash("sha256").update(expected).digest()
  const b = createHash("sha256").update(received).digest()

  return timingSafeEqual(a, b)
}

// Appelée par vivabox-operativo (serveur à serveur) juste après que l'équipe
// a confirmé une réservation, proposé une date alternative, ou annulé faute
// de disponibilité (voir src/app/reservas/actions.ts là-bas) — ces trois
// transitions de statut n'ont jamais lieu dans ce repo. Le contenu et
// l'envoi de l'email restent ici, à un seul endroit, pour rester cohérents
// avec "booking_received" et "welcome" qui partent déjà d'ici. Sans
// INTERNAL_API_SECRET configuré, la route refuse tout.
export async function POST(req: NextRequest) {
  if (!hasValidSecret(req)) {
    return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const bookingId = typeof body.bookingId === "string" ? body.bookingId : ""
    const kind = body.kind

    if (!UUID_RE.test(bookingId)) {
      return NextResponse.json({ success: false, error: "INVALID_BOOKING_ID" }, { status: 400 })
    }

    if (!ALLOWED_KINDS.includes(kind)) {
      return NextResponse.json({ success: false, error: "INVALID_KIND" }, { status: 400 })
    }

    const sent = await sendBeneficiaryBookingEmail(getSupabase(), bookingId, kind as BookingEmailKind)

    return NextResponse.json({ success: true, sent })
  } catch (error) {
    console.error("BOOKING NOTIFY ROUTE ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 })
  }
}
