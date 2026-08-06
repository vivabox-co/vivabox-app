import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques (pas besoin de session) : /activar et sous-routes (le
// formulaire lui-même, l'écran post-activation), plus les endpoints qui
// créent ou vérifient une session — on ne peut pas exiger une session pour
// accéder à la route qui en délivre une. /api/experiencias aussi : c'est le
// catalogue (rien de sensible par utilisateur), et les pages qui l'appellent
// sont déjà protégées côté page — le revalider ici coûterait ~700-800ms
// (aller-retour Supabase) pour rien à chaque chargement de carte/liste.
const publicRoutes = [
  '/activar',
  '/activacion-completa',
  '/api/codigo/context',
  '/api/activate_code',
  '/api/verify_access',
  '/api/experiencias',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ignorer les fichiers statiques (public/) et internes Next (sauf routes qu'on veut protéger)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Récupérer le token de session (cookie ou sessionStorage ? on utilise cookie)
  const sessionToken = request.cookies.get('vb_session')?.value;

  // 3. Si route publique → on laisse passer
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 4. Pas de token → rediriger vers /activar
  if (!sessionToken) {
    const url = new URL('/activar', request.url);
    return NextResponse.redirect(url);
  }

  // 5. Pour les routes protégées, on valide la session et on récupère le contexte du code
  //    (appel asynchrone bloquant - attention performance)
  try {
    const contextResponse = await fetch(`${request.nextUrl.origin}/api/codigo/context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sessionToken })
    });
    const context = await contextResponse.json();

    // Si l'appel échoue ou code invalide → déconnexion
    if (!context.success) {
      const response = NextResponse.redirect(new URL('/activar', request.url));
      response.cookies.delete('vb_session');
      return response;
    }

    const { estado, booking_id } = context.data;

    // Règles de routage selon état
    if (estado === 'Activada') {
      // Autoriser /mapa, /lista, /reservar (mais pas /reservar/seguimiento)
      if (pathname.startsWith('/reservar/seguimiento')) {
        return NextResponse.redirect(new URL('/mapa', request.url));
      }
      return NextResponse.next();
    }

    if (estado === 'Reservada' || estado === 'Confirmada') {
      // Si on essaie d'accéder à /mapa ou /lista → rediriger vers suivi
      if (pathname === '/mapa' || pathname === '/lista' || pathname === '/') {
        return NextResponse.redirect(new URL(`/reservar/seguimiento/${booking_id}`, request.url));
      }
      // Sinon, laisser passer (ex: page de suivi elle-même)
      return NextResponse.next();
    }

    // Tout autre état (Stock, Vendida, etc.) → déconnexion
    const response = NextResponse.redirect(new URL('/activar', request.url));
    response.cookies.delete('vb_session');
    return response;

  } catch (error) {
    // En cas d'erreur technique, on redirige vers activar
    console.error('Middleware session check failed:', error);
    const response = NextResponse.redirect(new URL('/activar', request.url));
    response.cookies.delete('vb_session');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};