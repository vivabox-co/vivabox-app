import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from "@/lib/services/supabase"
import { hashSessionToken } from "@/lib/utils/sessionToken"

const UNIQUE_VIOLATION = "23505"

// Table booking_reviews (voir migration SQL fournie séparément — pas encore
// versionnée dans le repo, ce projet gère son schéma Supabase à la main) :
//   id uuid pk, booking_id uuid unique references bookings(id),
//   activation_code_id uuid references activation_codes(id),
//   rating smallint check (1..5), comment text, created_at timestamptz

async function resolveOwnedBooking(req: NextRequest, bookingId: string) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
                || req.cookies.get('vb_session')?.value;
  if (!token) return { error: NextResponse.json({ success: false, error: "NO_SESSION" }, { status: 401 }) }

  const supabase = getSupabase()

  const { data: session, error: sessionError } = await supabase
    .from("activation_sessions")
    .select("activation_code_id, expires_at, revoked_at")
    .eq("token_hash", hashSessionToken(token))
    .maybeSingle()

  if (sessionError) {
    console.error("BOOKING REVIEW SESSION ERROR:", sessionError)
    return { error: NextResponse.json({ success: false, error: "SERVER_ERROR" }) }
  }
  if (!session || session.revoked_at || new Date(session.expires_at) < new Date()) {
    return { error: NextResponse.json({ success: false, error: "INVALID_SESSION" }) }
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, activation_code_id, status")
    .eq("id", bookingId)
    .maybeSingle()

  if (bookingError) {
    console.error("BOOKING REVIEW FETCH ERROR:", bookingError)
    return { error: NextResponse.json({ success: false, error: "SERVER_ERROR" }) }
  }
  if (!booking || booking.activation_code_id !== session.activation_code_id) {
    return { error: NextResponse.json({ success: false, error: "BOOKING_NOT_FOUND" }) }
  }

  return { supabase, booking }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const resolved = await resolveOwnedBooking(req, bookingId)
    if (resolved.error) return resolved.error
    const { supabase, booking } = resolved

    const { data: review, error } = await supabase
      .from("booking_reviews")
      .select("rating, comment, created_at")
      .eq("booking_id", booking.id)
      .maybeSingle()

    if (error) {
      console.error("BOOKING REVIEW GET ERROR:", error)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    return NextResponse.json({ success: true, data: review });

  } catch (error) {
    console.error("BOOKING REVIEW GET ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const resolved = await resolveOwnedBooking(req, bookingId)
    if (resolved.error) return resolved.error
    const { supabase, booking } = resolved

    // On ne laisse laisser un avis qu'une fois l'expérience vécue.
    if (booking.status !== "completed") {
      return NextResponse.json({ success: false, error: "INVALID_STATUS" });
    }

    const body = await req.json().catch(() => ({}));
    const rating = Number(body.rating)
    const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 1000) : null

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "INVALID_INPUT" }, { status: 400 });
    }

    const { data: review, error: insertError } = await supabase
      .from("booking_reviews")
      .insert({
        booking_id: booking.id,
        activation_code_id: booking.activation_code_id,
        rating,
        comment,
      })
      .select("rating, comment, created_at")
      .single()

    if (insertError) {
      if (insertError.code === UNIQUE_VIOLATION) {
        return NextResponse.json({ success: false, error: "ALREADY_REVIEWED" });
      }
      console.error("BOOKING REVIEW INSERT ERROR:", insertError)
      return NextResponse.json({ success: false, error: "SERVER_ERROR" });
    }

    return NextResponse.json({ success: true, data: review });

  } catch (error) {
    console.error("BOOKING REVIEW POST ERROR:", error)
    return NextResponse.json({ success: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
