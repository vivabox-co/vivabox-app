import { BookingStatus } from "@/components/ui/BookingTimeline"

export type Booking = {
  id: string
  experienceId: string
  date: string
  time: string
  status: BookingStatus
  createdAt: string

  // Horodatage serveur de la 1ère fois où /reservar/seguimiento a chargé
  // cette réservation alors qu'elle était "requested" — sert uniquement à
  // ancrer la mise en scène "Disponibilidad con el lugar" (voir
  // seguimiento/[bookingId]/page.tsx) sur un instant réel plutôt que sur le
  // temps passé en continu sur la page. null si jamais vue en "requested"
  // (ex: déjà "confirmed" à la 1ère ouverture).
  requestedSeenAt: string | null

  // Jusqu'à 3 dates préférées, classées par priorité (la première est celle
  // utilisée comme `date` ci-dessus) — un seul dossier de réservation, pas
  // trois réservations indépendantes.
  requestedDates: string[] | null

  // Renseignés uniquement quand status === "alternative_proposed" — la date
  // et le créneau que le lugar a proposés à la place de la demande initiale.
  proposedDate: string | null
  proposedMoment: string | null
  proposedHour: string | null

  experienceSnapshot: {
    id: string
    title: string
    image: string
    zone: string
    category: string
    providerName: string
  }
}
