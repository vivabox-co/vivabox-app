"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Map, List, Heart, Clock, MessageCircle } from "lucide-react";

/* 🔥 Recale la nav sur le viewport visuel réel : Safari iOS ne repositionne
   pas toujours les éléments `position: fixed` quand sa barre d'outils du
   bas se rétracte/déploie, ce qui coupe la nav de façon intermittente. */
function useSafariToolbarFix(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!el || !vv) return;

    function update() {
      const offset = window.innerHeight - vv!.height - vv!.offsetTop;
      el!.style.transform = `translateX(-50%) translateY(${-Math.max(0, offset)}px)`;
    }

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [ref]);
}

/* 🔥 Logo comme composant icône */
function LogoIcon({ size = 20 }: { size?: number }) {
  return (
    <img
      src="/logo/LogoVivaboxSVG.svg"
      alt="Vivabox"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}

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
  { href: "/experiencia", label: "Tu experiencia", Icon: (props) => <LogoIcon size={36} /> },
  { href: "/ayuda", label: "Ayuda", Icon: MessageCircle },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  useSafariToolbarFix(navRef);

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
    <nav className="bottom-nav" ref={navRef}>
      {items.map((item, index) => {
        const active = isActive(item);
        const Icon = item.Icon;

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
