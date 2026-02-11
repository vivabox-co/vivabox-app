import { BookingStatus } from "@/components/ui/BookingTimeline"

export type Booking = {
  id: string
  experienceId: string
  date: string
  time: string
  status: BookingStatus

  experienceSnapshot: {
    id: string
    title: string
    image: string
    zone: string
    category: string
    providerName: string
  }
}
