"use client";

import { ReactNode } from "react";
import BottomNav from "@/components/ui/BottomNav";
import { useUI } from "@/components/ui/UIContext";

export default function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { drawerOpen, hideNav } = useUI();

  return (
    <>
      {children}
      {!drawerOpen && !hideNav && <BottomNav />}
    </>
  );
}
