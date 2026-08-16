import { redirect } from "next/navigation"

// Filet de sécurité : le middleware redirige déjà '/' vers /activar avant
// que cette page ne soit jamais rendue. Ce redirect ne s'exécute que si le
// middleware est un jour contourné (mauvaise config de déploiement, etc.).
export default function Home() {
  redirect("/activar")
}
