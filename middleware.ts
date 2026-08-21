import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques (pas besoin de session) : l'écran post-activation, plus
// les endpoints qui créent ou vérifient une session — on ne peut pas exiger
// une session pour accéder à la route qui en délivre une. /api/experiencias
// aussi : c'est le catalogue (rien de sensible par utilisateur), et les
// pages qui l'appellent sont déjà protégées côté page — le revalider ici
// coûterait ~700-800ms (aller-retour Supabase) pour rien à chaque
// chargement de carte/liste.
// /activar (et sous-routes) n'est PAS dans cette liste : c'est un cas à
// part, géré juste en dessous, car un visiteur qui y arrive avec une
// session déjà valide (QR re-scanné, lien rouvert...) doit être renvoyé
// directement dans le flux au lieu de repasser par le formulaire.
const publicRoutes = [
  '/activacion-completa',
  '/api/codigo/context',
  '/api/activate_code',
  '/api/verify_access',
  '/api/experiencias',
];

const activationEntryRoute = '/activar';

type SessionContext = {
  estado: 'Activada' | 'Reservada' | 'Confirmada' | 'Rechazada';
  booking_id: string | null;
  // Non-null quand /api/codigo/context a glissé la session (voir ce fichier) :
  // le cookie doit être réémis avec cette nouvelle expiration.
  renewedExpiresAt: string | null;
};

// Valide le token de session et renvoie l'état du code (ou null si la
// session est invalide/expirée/technique en échec). Partagé entre le
// contournement de /activar et la protection des routes normales.
async function resolveSessionContext(request: NextRequest, sessionToken: string): Promise<SessionContext | null> {
  try {
    const contextResponse = await fetch(`${request.nextUrl.origin}/api/codigo/context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sessionToken })
    });
    const context = await contextResponse.json();
    if (!context.success) return null;
    return context.data;
  } catch (error) {
    console.error('Middleware session check failed:', error);
    return null;
  }
}

// Session glissante : si /api/codigo/context a prolongé la session, on
// réémet le cookie avec la nouvelle expiration sur la réponse renvoyée au
// navigateur (sinon le cookie garderait son ancienne date malgré la
// prolongation en base).
function withRenewedCookie(response: NextResponse, sessionToken: string, context: SessionContext): NextResponse {
  if (context.renewedExpiresAt) {
    response.cookies.set('vb_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(context.renewedExpiresAt),
      path: '/',
    });
  }
  return response;
}

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

  // 1bis. Routes protégées par leur propre secret (pas par vb_session) :
  //       le cron Vercel (CRON_SECRET) et l'annulation admin (ADMIN_API_KEY,
  //       voir PATCH /api/booking/[bookingId]) sont des appels serveur-à-
  //       serveur qui n'ont jamais de cookie de session bénéficiaire — les
  //       laisser tomber dans la règle 6 ci-dessous les redirigeait vers
  //       /activar avant même d'atteindre le handler, qui revalide de toute
  //       façon son propre header.
  if (
    pathname.startsWith('/api/cron/') ||
    (pathname.startsWith('/api/booking/') && request.method === 'PATCH')
  ) {
    return NextResponse.next();
  }

  // 2. Racine de l'app → toujours vers l'activation. C'est /activar
  //    (bloc suivant) qui décide ensuite, selon l'état de session, si on
  //    montre le formulaire ou si on redirige plus loin (/mapa, suivi...).
  //    Pas de boucle : '/' est un cas à part, distinct de '/activar'.
  if (pathname === '/') {
    return NextResponse.redirect(new URL(activationEntryRoute, request.url));
  }

  // 3. Récupérer le token de session (cookie)
  const sessionToken = request.cookies.get('vb_session')?.value;

  // 4. /activar : si une session valide existe déjà, on saute le formulaire
  //    et on renvoie directement dans le flux (mêmes règles de routage que
  //    pour les routes protégées ci-dessous). Pas de session → on laisse
  //    passer normalement (route publique).
  if (pathname.startsWith(activationEntryRoute)) {
    if (!sessionToken) {
      return NextResponse.next();
    }

    const context = await resolveSessionContext(request, sessionToken);
    if (!context) {
      // Session périmée/invalide : on laisse voir le formulaire et on
      // nettoie le cookie mort au passage.
      const response = NextResponse.next();
      response.cookies.delete('vb_session');
      return response;
    }

    // Seule une réservation encore en cours (Reservada/Confirmada) justifie
    // de forcer /reservar/seguimiento depuis ici — "Rechazada" (annulée)
    // retombe avec "Activada" vers /mapa : sinon quiconque a une réservation
    // annulée revoit cet écran à chaque fois qu'il ouvre l'app, sans jamais
    // pouvoir en sortir depuis la racine. L'écran de refus reste atteignable
    // manuellement (nav "Seguimiento", lien direct) — voir la branche
    // "Rechazada" plus bas, qui ne bloque pas cet accès.
    if (context.estado === 'Reservada' || context.estado === 'Confirmada') {
      const redirect = NextResponse.redirect(new URL(`/reservar/seguimiento/${context.booking_id}`, request.url));
      return withRenewedCookie(redirect, sessionToken, context);
    }
    return withRenewedCookie(NextResponse.redirect(new URL('/mapa', request.url)), sessionToken, context);
  }

  // 5. Si route publique → on laisse passer
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 6. Pas de token → rediriger vers /activar
  if (!sessionToken) {
    const url = new URL('/activar', request.url);
    return NextResponse.redirect(url);
  }

  // 7. Pour les routes protégées, on valide la session et on récupère le contexte du code
  //    (appel asynchrone bloquant - attention performance)
  const context = await resolveSessionContext(request, sessionToken);

  // Session invalide/expirée ou erreur technique → déconnexion
  if (!context) {
    const response = NextResponse.redirect(new URL('/activar', request.url));
    response.cookies.delete('vb_session');
    return response;
  }

  const { estado, booking_id } = context;

  // Règles de routage selon état
  if (estado === 'Activada') {
    // Autoriser /mapa, /lista, /reservar (mais pas /reservar/seguimiento)
    if (pathname.startsWith('/reservar/seguimiento')) {
      return withRenewedCookie(NextResponse.redirect(new URL('/mapa', request.url)), sessionToken, context);
    }
    return withRenewedCookie(NextResponse.next(), sessionToken, context);
  }

  if (estado === 'Reservada' || estado === 'Confirmada') {
    // Si on essaie d'accéder à /mapa, /lista, /favoritos ou de relancer une
    // réservation via /reservar/fechas → rediriger vers suivi. Exact match sur
    // '/reservar/fechas' (pas de startsWith) pour ne pas emporter avec lui
    // '/reservar/fechas/confirmacion', qui doit rester atteignable juste après
    // la création de la réservation (c'est justement elle qui fait passer
    // l'estado à 'Reservada').
    if (
      pathname === '/mapa' ||
      pathname === '/lista' ||
      pathname === '/favoritos' ||
      pathname === '/reservar/fechas' ||
      pathname === '/'
    ) {
      const redirect = NextResponse.redirect(new URL(`/reservar/seguimiento/${booking_id}`, request.url));
      return withRenewedCookie(redirect, sessionToken, context);
    }
    // Sinon, laisser passer (ex: page de suivi elle-même)
    return withRenewedCookie(NextResponse.next(), sessionToken, context);
  }

  if (estado === 'Rechazada') {
    // Contrairement à Reservada/Confirmada, on ne force pas la redirection
    // depuis /mapa ou /lista : la personne doit pouvoir repartir chercher une
    // autre expérience. Mais contrairement à Activada, on ne bloque plus
    // l'accès à /reservar/seguimiento — elle doit pouvoir revoir pourquoi sa
    // réservation a été refusée si elle y retourne (bouton retour, lien...).
    return withRenewedCookie(NextResponse.next(), sessionToken, context);
  }

  // Tout autre état (Stock, Vendida, etc.) → déconnexion
  const response = NextResponse.redirect(new URL('/activar', request.url));
  response.cookies.delete('vb_session');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};