"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Map, List, Heart, Clock, Sparkles, MessageCircle } from "lucide-react";

type Item = {
  href?: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  action?: (router: any) => void;
};

/* 🔹 NAV EXPLORATION */
const exploreItems: Item[] = [
  { href: "/mapa", label: "Mapa", Icon: Map },
  { href: "/lista", label: "Lista", Icon: List },
  { href: "/favoritos", label: "Favoritos", Icon: Heart },
];

/* 🔹 NAV POST-RÉSERVATION */
const bookingItems: Item[] = [
  {
    label: "Seguimiento",
    Icon: Clock,
    action: (router) => {
      const stored = localStorage.getItem("currentBooking");
      if (!stored) return;
      const booking = JSON.parse(stored);
      router.push(`/reservar/seguimiento/${booking.id}`);
    },
  },
  { href: "/experiencia", label: "Tu experiencia", Icon: Sparkles },
  { href: "/ayuda", label: "Ayuda", Icon: MessageCircle },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isBookingFlow =
    pathname.startsWith("/reservar/seguimiento") ||
    pathname.startsWith("/experiencia") ||
    pathname.startsWith("/ayuda");

  const items = isBookingFlow ? bookingItems : exploreItems;

  function isActive(item: Item) {
    if (item.label === "Seguimiento") {
      return pathname.startsWith("/reservar/seguimiento");
    }
    if (!item.href) return false;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  return (
    <nav className="bottom-nav">
      {items.map((item, index) => {
        const active = isActive(item);
        const Icon = item.Icon;

        // 🔥 CAS SPÉCIAL : Seguimiento (route dynamique)
        if (item.action) {
          return (
            <div
              key={index}
              onClick={() => item.action!(router)}
              className={`bottom-nav-item ${active ? "active" : ""}`}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
              <span>{item.label}</span>
            </div>
          );
        }

        // 🔹 CAS NORMAL
        return (
          <Link
            key={item.href}
            href={item.href!}
            className={`bottom-nav-item ${active ? "active" : ""}`}
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
