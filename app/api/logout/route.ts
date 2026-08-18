import { NextResponse } from "next/server"

// Déconnexion volontaire du bénéficiaire : supprime le cookie de session
// httpOnly (illisible/effaçable en JS côté client, donc il faut passer par
// une route serveur) pour qu'il retombe sur /activar au prochain accès.
export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete("vb_session")
  return response
}
