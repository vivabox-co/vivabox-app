"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Map, List, Heart, Clock, HelpCircle } from "lucide-react";
import { getCurrentBookingId } from "@/lib/data/getCurrentBookingId";
import { useUI } from "@/components/ui/UIContext";
import { getNavGroup, NavGroup } from "@/lib/utils/getNavGroup";

/* 🔥 Recale la nav sur le viewport visuel réel : Safari iOS ne repositionne
   pas toujours les éléments `position: fixed` quand sa barre d'outils du
   bas se rétracte/déploie, ce qui coupe la nav de façon intermittente.
   Strictement limité à iOS : sur Android, `window.innerHeight` se resize déjà
   en même temps que la barre d'adresse (contrairement à iOS où il reste fixe),
   donc `position: fixed` s'y comporte bien nativement. Appliquer ce correctif
   là-bas faisait plus de mal que de bien — les deux valeurs de viewport se
   désynchronisent une frame pendant l'animation de la barre, ce qui envoyait
   un translateY erroné et faisait "décrocher" la nav en plein scroll. */
function isIOS() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function useSafariToolbarFix(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!el || !vv || !isIOS()) return;

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
  action?: (router: any, beginRouteTransition: (group?: NavGroup) => void) => void;
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
      beginRouteTransition("booking");
      router.push(`/reservar/seguimiento/${bookingId}`);
    },
  },
  { href: "/experiencia", label: "Tu experiencia", Icon: ({ active }) => <LogoIcon size={34} active={active} /> },
  { href: "/ayuda", label: "Ayuda", Icon: HelpCircle },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { beginRouteTransition, pendingNavGroup } = useUI();
  const navRef = useRef<HTMLElement>(null);
  useSafariToolbarFix(navRef);

  const currentGroup = getNavGroup(pathname);
  const isBookingFlow = currentGroup === "booking";

  const items = isBookingFlow ? bookingItems : exploreItems;

  // Le loader de transition ne recouvre pas la nav pendant les navigations
  // déclenchées d'ici (voir RouteLoaderOverlay) : elle reste donc figée —
  // visible mais non cliquable — jusqu'à ce que la nouvelle page soit prête,
  // pour éviter d'empiler une 2e navigation en pleine transition.
  const frozen = pendingNavGroup !== null;

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
    <nav
      className="bottom-nav"
      ref={navRef}
      // Figée le temps du chargement (voir RouteLoaderOverlay) : la nav
      // reste visible mais ne doit pas armer une 2e navigation avant que la
      // première ait fini d'atterrir.
      style={frozen ? { pointerEvents: "none" } : undefined}
    >
      {showHelpBubble && (
        <Link
          href="/ayuda-general"
          onClick={() => {
            if (!frozen) beginRouteTransition(currentGroup);
          }}
          aria-label="Ayuda"
          className="bottom-nav-help"
        >
          <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>?</span>
        </Link>
      )}

      {items.map((item, index) => {
        const active = isActive(item);
        const Icon = item.Icon;

        if (item.action) {
          return (
            <div
              key={index}
              onClick={() => {
                if (!frozen) item.action!(router, beginRouteTransition);
              }}
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
              if (!active && !frozen) beginRouteTransition(currentGroup);
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
