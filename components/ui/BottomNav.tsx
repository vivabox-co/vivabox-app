"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Map, List, Heart, Clock, MessageCircle, LogOut } from "lucide-react";
import { getCurrentBookingId } from "@/lib/data/getCurrentBookingId";

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
    action: async (router) => {
      const bookingId = await getCurrentBookingId();
      if (!bookingId) return;
      router.push(`/reservar/seguimiento/${bookingId}`);
    },
  },
  { href: "/experiencia", label: "Tu experiencia", Icon: (props) => <LogoIcon size={36} /> },
  { href: "/ayuda", label: "Ayuda", Icon: MessageCircle },
];

async function handleLogout() {
  if (!window.confirm("¿Cerrar sesión y volver al inicio?")) return;

  try {
    await fetch("/api/logout", { method: "POST" });
  } catch {
    // Le cookie httpOnly ne peut être effacé que côté serveur ; si l'appel
    // échoue on redirige quand même — /activar redemandera le code au
    // prochain accès si le cookie a survécu.
  }

  sessionStorage.removeItem("vb_session");
  sessionStorage.removeItem("vb_codigo");
  localStorage.removeItem("currentBooking");

  // Full reload (pas router.push) pour repartir avec un contexte UI/état vierge.
  window.location.href = "/activar";
}

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
      <button
        onClick={handleLogout}
        aria-label="Cerrar sesión"
        className="bottom-nav-logout"
      >
        <LogOut size={13} strokeWidth={1.8} />
      </button>

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
