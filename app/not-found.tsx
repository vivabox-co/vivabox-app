import { redirect } from "next/navigation"

// Toute route inexistante ramène directement vers l'activation plutôt que
// d'afficher une 404 générique — les visiteurs sans session y sont déjà
// redirigés par le middleware ; ce fichier couvre le cas d'une session
// valide qui tape une URL qui n'existe pas.
export default function NotFound() {
  redirect("/activar")
}
