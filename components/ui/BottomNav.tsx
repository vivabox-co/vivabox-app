"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Map, List, Heart, Clock, MessageCircle } from "lucide-react";
import { getCurrentBookingId } from "@/lib/data/getCurrentBookingId";
import { useUI } from "@/components/ui/UIContext";

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

/* 🔥 Logo comme composant icône. En état actif, la pastille de fond est du
   même bleu marine (#152F40) que la silhouette du logo : on bascule sur une
   variante où cette silhouette est blanche pour garder du contraste. */
function LogoIcon({ size = 20, active = false }: { size?: number; active?: boolean }) {
  return (
    <img
      src={active ? "/logo/LogoVivaboxSVG-white.svg" : "/logo/LogoVivaboxSVG.svg"}
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
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; active?: boolean }>;
  action?: (router: any, beginRouteTransition: () => void) => void;
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
    action: async (router, beginRouteTransition) => {
      const bookingId = await getCurrentBookingId();
      if (!bookingId) return;
      beginRouteTransition();
      router.push(`/reservar/seguimiento/${bookingId}`);
    },
  },
  { href: "/experiencia", label: "Tu experiencia", Icon: ({ active }) => <LogoIcon size={34} active={active} /> },
  { href: "/ayuda", label: "Ayuda", Icon: MessageCircle },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { beginRouteTransition } = useUI();
  const navRef = useRef<HTMLElement>(null);
  useSafariToolbarFix(navRef);

  const isBookingFlow =
    pathname.startsWith("/reservar/seguimiento") ||
    pathname.startsWith("/experiencia") ||
    pathname.startsWith("/ayuda");

  const items = isBookingFlow ? bookingItems : exploreItems;

  // En mode réservation, l'aide est déjà un item de la nav principale
  // (bookingItems ci-dessus) ; la bulle flottante ne sert donc que côté
  // exploration (Mapa/Lista/Favoritos), et pas sur /ayuda-general elle-même
  // pour éviter un accès qui pointe vers la page déjà affichée.
  const showHelpBubble = !isBookingFlow && !pathname.startsWith("/ayuda-general");

  function isActive(item: Item) {
    if (item.label === "Seguimiento") {
      return pathname.startsWith("/reservar/seguimiento");
    }
    if (!item.href) return false;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  return (
    <nav className="bottom-nav" ref={navRef}>
      {showHelpBubble && (
        <Link
          href="/ayuda-general"
          onClick={() => beginRouteTransition()}
          aria-label="Ayuda"
          className="bottom-nav-help"
        >
          <MessageCircle size={15} strokeWidth={1.8} />
        </Link>
      )}

      {items.map((item, index) => {
        const active = isActive(item);
        const Icon = item.Icon;

        if (item.action) {
          return (
            <div
              key={index}
              onClick={() => item.action!(router, beginRouteTransition)}
              className={`bottom-nav-item ${active ? "active" : ""}`}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 1.8} active={active} />
              <span>{item.label}</span>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href!}
            // L'App Router ne met à jour le pathname qu'une fois la route de
            // destination chargée (voir le commentaire dans UIContext) : sans
            // ce déclenchement au clic, RouteLoaderOverlay ne se réaffiche
            // qu'une fois cette navigation déjà terminée, laissant l'ancienne
            // page affichée sans rien pendant tout le chargement.
            onClick={() => {
              if (!active) beginRouteTransition();
            }}
            className={`bottom-nav-item ${active ? "active" : ""}`}
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 1.8} active={active} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
