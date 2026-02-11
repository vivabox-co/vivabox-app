# TECH_CONTEXT.md

Contexte technique global de la web app bénéficiaire Vivabox.  
Ce document décrit **comment le système fonctionne**, pas pourquoi.

---

## 1. STACK GLOBAL

| Élément | Choix |
|--------|------|
| Framework | Next.js (App Router) |
| Langage | TypeScript |
| UI | React client components |
| Styles | Inline styles majoritaires |
| Map | Leaflet (dynamic import, client only) |
| Icônes | lucide-react |
| État global | React Context (UIContext) |
| Données | Fichiers mock via `fetchExperiences()` |
| Backend | Aucun (Alpha) |
| Auth | Aucune |
| Paiement | Aucun |
| API | Aucune |

---

## 2. STRUCTURE APP ROUTER

/app
/welcome
/activar
/activado
/mapa
/lista
/lista/categoria/[category]
/reservar/fechas
/reservar/confirmacion
/reservar/seguimiento/[id]
/experiencia
/ayuda


Toutes les routes sont **client-driven**.

---

## 3. ARCHITECTURE UI

### Structure principale

AppShell
├─ Map / Page content
├─ BottomSheet (expériences)
├─ FiltersDrawer
└─ BottomNav


Le BottomSheet est un composant système central.

---

## 4. GESTION D’ÉTAT

### UIContext

Variables globales principales :

| State | Rôle |
|------|------|
| `selectedExperience` | Expérience active pour le sheet |
| `drawerOpen` | Ouverture du BottomSheet |
| `hideNav` | Masquer ou afficher la bottom nav |

---

### Local State

Géré dans pages :

- Code activation
- Email / name
- Filtres
- Favoris (UI seulement)
- Date proposée
- Booking simulé

---

## 5. DONNÉES

### Source

/lib/data/fetchExperiences.ts


Retourne liste mock.

### Structure Experience

- id
- title
- image
- category
- zone
- duration
- format
- includes[]
- vivanote
- importantToKnow[]
- idealFor[]

---

## 6. SYSTÈME CARTE

Composant : `MapView`

- Pins dynamiques par catégorie
- Couleurs via `categoryColors`
- Filtrage côté client
- Sélection pin → ouvre BottomSheet

---

## 7. BOTTOM SHEET SYSTEM

Composant clé :

components/ui/BottomSheet.tsx


Fonctions :

- Hauteur dynamique 50% → 80%
- Drag tactile
- Scroll interne indépendant
- Footer CTA fixe
- Ne bloque pas bottom nav

---

## 8. NAVIGATION

### BottomNav

Deux modes :

| Mode | Items |
|------|------|
| Exploration | Mapa, Lista, Favoritos |
| Post-réservation | Seguimiento, Tu experiencia, Ayuda |

---

## 9. LOGIQUE RÉSERVATION (ALPHA)

Simulée uniquement :

- localStorage `currentBooking`
- Status simulé via timers
- Aucune API réelle

---

## 10. DÉCISIONS TECHNIQUES IMPORTANTES

| Décision | Raison |
|----------|--------|
| Inline styles | Rapidité itération |
| Client only map | Leaflet SSR impossible |
| Pas de backend | Focus UX Alpha |
| BottomSheet custom | Contrôle UX mobile |
| Données mock | Pas dépendance externe |

---

## 11. CONTRAINTES

- Mobile-first
- Aucun chargement lourd
- Aucune dépendance serveur
- Navigation instantanée
- États non persistés hors booking simulé

---

## 12. POINTS SENSIBLES

| Zone | Risque |
|------|-------|
| BottomSheet | Hooks / scroll / drag |
| MapView | Performance |
| Routing dynamique | id booking |
| Données mock | Incohérences possibles |

---

## 13. ÉTAT DU PROJET

Alpha UX prototypé  
Architecture prête pour :

- Backend futur
- Auth future
- Système prestataire
- Calendrier réel
- Paiements différés