import { BookingStatus } from "@/components/ui/BookingTimeline"

export type Booking = {
  id: string
  experienceId: string
  date: string
  time: string
  status: BookingStatus
  createdAt: string

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
