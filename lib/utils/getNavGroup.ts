export type NavGroup = "explore" | "booking"

// Même test que isBookingFlow dans BottomNav.tsx : /experiencia, /ayuda et
// /reservar/seguimiento affichent bookingItems (Seguimiento/Tu experiencia/
// Ayuda), tout le reste (dont /ayuda-general) affiche exploreItems.
export function getNavGroup(pathname: string): NavGroup {
  const isBooking =
    pathname.startsWith("/reservar/seguimiento") ||
    pathname.startsWith("/experiencia") ||
    pathname === "/ayuda" ||
    pathname.startsWith("/ayuda/")

  return isBooking ? "booking" : "explore"
}
