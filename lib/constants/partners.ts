// Marques partenaires pour le co-branding de l'écran d'accueil d'activation
// (/activar/<slug>). Pour ajouter une entreprise : une entrée ici + son logo
// dans public/logo/partners/.
export type Partner = {
  slug: string
  name: string
  logo: string
  intro: string
  main: { before: string; accent: string; after: string }
  description: string
}

export const PARTNERS: Record<string, Partner> = {
  ignia: {
    slug: "ignia",
    name: "Ignia",
    logo: "/logo/partners/ignia.png",
    intro: "Ignia te ofrece un regalo.",
    main: { before: "Ahora ", accent: "eliges tú", after: " la experiencia." },
    description: "Descubre las experiencias que Ignia y Vivabox tienen para ti.",
  },
}

export function getPartner(slug: string): Partner | null {
  return PARTNERS[slug.toLowerCase()] ?? null
}
