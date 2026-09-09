import { NextResponse, userAgent } from 'next/server';
import type { NextRequest } from 'next/server';

// Cookie posé quand quelqu'un débloque volontairement l'accès desktop (voir
// desktopGate ci-dessous) — non httpOnly car DesktopGate.tsx (filet de
// sécurité côté client, voir ClientLayout.tsx) doit pouvoir le lire pour ne
// pas rediriger quelqu'un qui vient juste de passer le gate serveur.
const DESKTOP_GATE_BYPASS_COOKIE = 'vb_desktop_ok';
const DESKTOP_GATE_ROUTE = '/solo-movil';

// L'app est pensée pour un usage mobile (activation par QR code scanné au
// téléphone) : on bloque l'accès desktop pour éviter une expérience cassée
// (layout, tactile...) plutôt que de la rendre "responsive" pour un usage
// qu'on ne veut pas supporter. Désactivé en local (`next dev`) pour ne pas
// gêner le développement — voir aussi DesktopGate.tsx, un filet de sécurité
// côté client pour les user-agents que userAgent() ne reconnaît pas.
function desktopGate(request: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV !== 'production') return null;

  if (request.cookies.get(DESKTOP_GATE_BYPASS_COOKIE)?.value === '1') {
    return null;
  }

  // Déblocage volontaire (nous, en dev/tests sur preview ou prod) via
  // ?vb_desktop=<DESKTOP_PREVIEW_KEY> — pose le cookie puis nettoie l'URL.
  const previewKey = request.nextUrl.searchParams.get('vb_desktop');
  if (previewKey && process.env.DESKTOP_PREVIEW_KEY && previewKey === process.env.DESKTOP_PREVIEW_KEY) {
    const cleanUrl = new URL(request.nextUrl);
    cleanUrl.searchParams.delete('vb_desktop');
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(DESKTOP_GATE_BYPASS_COOKIE, '1', {
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return response;
  }

  const { device } = userAgent(request);
  if (device.type === 'mobile' || device.type === 'tablet') {
    return null;
  }

  return NextResponse.redirect(new URL(DESKTOP_GATE_ROUTE, request.url));
}

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
  // CGU / politique de données : doivent rester accessibles sans session
  // puisqu'on les lie depuis le formulaire d'activation lui-même, avant
  // toute session (voir app/activar/datos/page.tsx).
  '/legal',
  // Écran affiché quand la vérification de session échoue pour une raison
  // technique (voir resolveSessionContext ci-dessous) — doit rester
  // atteignable sans repasser par la validation qui vient d'échouer.
  '/reintentar',
  // Écran du gate desktop (voir desktopGate) : doit s'afficher tel quel,
  // qu'il y ait une session ou non, sinon la règle 6 plus bas le renvoie
  // vers /activar avant même que la personne ne le voie.
  DESKTOP_GATE_ROUTE,
];

const activationEntryRoute = '/activar';

type SessionContext = {
  estado: 'Activada' | 'Reservada' | 'Confirmada' | 'Rechazada';
  booking_id: string | null;
  // Non-null quand /api/codigo/context a glissé la session (voir ce fichier) :
  // le cookie doit être réémis avec cette nouvelle expiration.
  renewedExpiresAt: string | null;
};

// 'valid'/'invalid' viennent d'une réponse de /api/codigo/context qui a pu
// trancher (session ok, ou vraiment expirée/révoquée/inconnue). 'error' est
// un échec purement technique de cette vérification (timeout, réseau,
// panne Supabase) — on ne peut RIEN en conclure sur la session elle-même,
// donc il ne doit jamais être traité comme 'invalid' (voir plus bas :
// contrairement à 'invalid', 'error' ne supprime jamais le cookie).
type SessionCheckResult =
  | { status: 'valid'; context: SessionContext }
  | { status: 'invalid' }
  | { status: 'error' };

const SESSION_CHECK_TIMEOUT_MS = 2500;

async function fetchSessionContext(request: NextRequest, sessionToken: string): Promise<SessionCheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SESSION_CHECK_TIMEOUT_MS);
  try {
    const contextResponse = await fetch(`${request.nextUrl.origin}/api/codigo/context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sessionToken }),
      signal: controller.signal,
    });
    if (!contextResponse.ok) {
      return { status: 'error' };
    }
    const context = await contextResponse.json();
    if (context.success) {
      return { status: 'valid', context: context.data };
    }
    // SERVER_ERROR = la route a elle-même buté sur une erreur technique
    // (Supabase down/lent) et ne peut pas dire si la session est valide.
    // Tout autre code (NO_TOKEN, INVALID_SESSION, NOT_ACTIVATED) est un
    // verdict réel : la session n'est effectivement pas utilisable.
    if (context.error === 'SERVER_ERROR') {
      return { status: 'error' };
    }
    return { status: 'invalid' };
  } catch (error) {
    console.error('Middleware session check failed:', error);
    return { status: 'error' };
  } finally {
    clearTimeout(timeout);
  }
}

// Valide le token de session. Un seul retry sur échec technique : un hoquet
// réseau isolé (fréquent au réveil d'une PWA remise au premier plan, pile
// quand la connexion bascule wifi/4G) ne doit pas suffire à conclure à une
// panne, mais on ne s'acharne pas non plus pour ne pas doubler la latence
// d'une vraie panne Supabase.
async function resolveSessionContext(request: NextRequest, sessionToken: string): Promise<SessionCheckResult> {
  const first = await fetchSessionContext(request, sessionToken);
  if (first.status !== 'error') return first;
  return fetchSessionContext(request, sessionToken);
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

  // 1bis. Restriction desktop (toute l'app hors /api — un cron/webhook n'a
  //       pas de "type d'appareil" pertinent, et le bloquer casserait des
  //       appels serveur-à-serveur légitimes). Voir desktopGate ci-dessus.
  if (!pathname.startsWith('/api/') && pathname !== DESKTOP_GATE_ROUTE) {
    const gate = desktopGate(request);
    if (gate) return gate;
  }

  // 1ter. Routes protégées par leur propre secret (pas par vb_session) :
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

    const result = await resolveSessionContext(request, sessionToken);
    if (result.status === 'error') {
      // Panne technique : impossible de savoir si cette session (peut-être
      // valide) l'est vraiment. On ne touche pas au cookie et on affiche un
      // écran neutre plutôt que de forcer le formulaire d'activation.
      return NextResponse.redirect(new URL(`/reintentar?next=${encodeURIComponent(pathname)}`, request.url));
    }
    if (result.status === 'invalid') {
      // Session périmée/invalide (verdict réel, pas une panne) : on laisse
      // voir le formulaire et on nettoie le cookie mort au passage.
      const response = NextResponse.next();
      response.cookies.delete('vb_session');
      return response;
    }
    const context = result.context;

    // Une réservation en cours (Reservada/Confirmada) OU tout juste annulée
    // et pas encore vue (Rechazada) justifie de forcer /reservar/seguimiento
    // depuis ici : la personne doit voir l'écran d'annulation et cliquer
    // elle-même sur "Elegir otra experiencia" avant de pouvoir repartir vers
    // /mapa — voir respond-alternative, qui bascule "cancelled" en
    // "cancelled_seen" (→ estado "Activada") à ce moment-là seulement.
    if (context.estado === 'Reservada' || context.estado === 'Confirmada' || context.estado === 'Rechazada') {
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
  const result = await resolveSessionContext(request, sessionToken);

  // Panne technique de la vérification (pas un verdict sur la session) :
  // on garde le cookie intact et on montre un écran de reprise plutôt que
  // de déconnecter quelqu'un dont la session est en réalité valide.
  if (result.status === 'error') {
    return NextResponse.redirect(new URL(`/reintentar?next=${encodeURIComponent(pathname)}`, request.url));
  }

  // Session invalide/expirée (verdict réel) → déconnexion
  if (result.status === 'invalid') {
    const response = NextResponse.redirect(new URL('/activar', request.url));
    response.cookies.delete('vb_session');
    return response;
  }

  const context = result.context;
  const { estado, booking_id } = context;

  // Règles de routage selon état
  if (estado === 'Activada') {
    // Autoriser /mapa, /lista, /reservar (mais pas /reservar/seguimiento)
    if (pathname.startsWith('/reservar/seguimiento')) {
      return withRenewedCookie(NextResponse.redirect(new URL('/mapa', request.url)), sessionToken, context);
    }
    return withRenewedCookie(NextResponse.next(), sessionToken, context);
  }

  if (estado === 'Reservada' || estado === 'Confirmada' || estado === 'Rechazada') {
    // Si on essaie d'accéder à /mapa, /lista, /favoritos ou de relancer une
    // réservation via /reservar/fechas → rediriger vers suivi. Exact match sur
    // '/reservar/fechas' (pas de startsWith) pour ne pas emporter avec lui
    // '/reservar/fechas/confirmacion', qui doit rester atteignable juste après
    // la création de la réservation (c'est justement elle qui fait passer
    // l'estado à 'Reservada').
    // 'Rechazada' (réservation annulée, pas encore vue) est traité pareil :
    // la personne doit atterrir sur l'écran de suivi, voir le message
    // d'annulation, et cliquer elle-même sur "Elegir otra experiencia" avant
    // de pouvoir revenir sur /mapa — ce clic appelle respond-alternative, qui
    // bascule le statut en "cancelled_seen" (→ estado "Activada") et lève le
    // blocage à partir de là.
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