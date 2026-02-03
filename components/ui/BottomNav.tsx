"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, List, Heart } from "lucide-react";

type Item = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

const items: Item[] = [
  { href: "/mapa", label: "Mapa", Icon: Map },
  { href: "/lista", label: "Lista", Icon: List },
  { href: "/favoritos", label: "Favoritos", Icon: Heart },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          pathname.startsWith(item.href + "/");

        const Icon = item.Icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${active ? "active" : ""}`}
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.4 : 1.8}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
