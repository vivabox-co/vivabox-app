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

Fichier :  
components/ui/UIContext.tsx

Variables globales principales :

| State | Rôle |
|------|------|
| `selectedExperience` | Expérience active pour le sheet |
| `drawerOpen` | Ouverture du BottomSheet |
| `hideNav` | Masquer ou afficher la bottom nav |
| `favorites` | Favoris utilisateur (localStorage) |
| `activeExperience` | Expérience survolée / focus UI |
| `selectedDate` | Date sélectionnée (booking) |
| `selectedTime` | Créneau horaire sélectionné |

---

### Local State

Géré dans pages :

- Code activation
- Email / name
- Filtres
- Favoris (UI seulement)
- Date proposée
- Booking simulé
- États overlays (Reco, Filters)

---

## 5. DONNÉES

### Source principale

/lib/data/fetchExperiences.ts

- Chargement CSV Google Sheet
- Normalisation data (category, activity_key, format)
- Validation coordonnées map
- Fallbacks sécurité

### Structure Experience

/lib/data/types.ts

- id
- title
- providerName
- image
- category
- activity_key
- zone
- city
- lat / lng
- duration
- durationType
- format
- vivanote
- includes[]
- requirements[]
- idealFor[]
- effortLevel
- ambiance[]
- environment
- needsPhone
- needsPeopleCount
- extraPeopleOption

---

## 6. SYSTÈME CARTE

### MapView

components/map/MapView.tsx

- Leaflet client-only
- Pins par catégorie
- Couleurs via `categoryColors`
- Regroupement par activité
- Sélection pin → `setSelectedExperience` → BottomSheet

### Helpers Map

/lib/map/categoryColors.ts  
/lib/map/categoryLabels.ts  
/lib/map/formatLabels.ts  

---

## 7. SYSTÈME DE FILTRAGE

### Logique filtre

/lib/product/filterExperiences.ts

Filtres combinables :
- category
- format
- city
- ambiance
- indoor/outdoor
- activity_key
- texte libre (lista)

### Génération dynamique filtres

/lib/product/buildActivityFilters.ts

- Construit les filtres activités à partir des données chargées
- Évite toute hardcode UI

---

## 8. BOTTOM SHEET SYSTEM

Composant clé :

components/ui/BottomSheet.tsx

Fonctions :

- Hauteur dynamique (50% → 80%)
- Drag tactile
- Scroll interne indépendant
- Footer CTA fixe
- Superposition au-dessus de BottomNav
- Bloque interaction arrière-plan

---

## 9. OVERLAY DE RECOMMANDATION (RECO)

### Dossier

components/reco/

### Fichiers

- RecoOverlay.tsx → orchestrateur
- QuestionScreen.tsx → Q1 / Q2 / Q3
- Top3Screen.tsx → résultats
- DetailScreen.tsx → immersion expérience
- RecoStateMachine.ts → états de navigation
- recoEngine.ts → scoring
- recoDataset.ts → métadonnées Google Sheet
- recoTypes.ts → types métier

### Logique

- Toujours 3 questions
- Arborescence conditionnelle
- Sortie = Top 3 expériences maximum
- Aucune notion de prix visible
- UX guidée, jamais analytique

---

## 10. NAVIGATION

### BottomNav

components/ui/BottomNav.tsx

Deux modes :

| Mode | Items |
|------|------|
| Exploration | Mapa, Lista, Favoritos |
| Post-réservation | Seguimiento, Tu experiencia, Ayuda |

Affichage conditionné par `hideNav`.

---

## 11. LOGO FLOTTANT GLOBAL

Présent sur :
- /mapa
- /lista

Caractéristiques :
- Position fixed top-right
- Cercle blanc semi-transparent
- Déclenche RecoOverlay
- Espace réservé via padding dynamique dans headers

⚠️ Toute barre sticky doit réserver l’espace du logo.

---

## 12. LOGIQUE RÉSERVATION (ALPHA)

Simulée uniquement :

- localStorage `currentBooking`
- Pages :
  - /reservar/fechas
  - /reservar/confirmacion
  - /reservar/seguimiento/[id]
- Status simulé via timers
- Aucun backend réel

---

## 13. DÉCISIONS TECHNIQUES IMPORTANTES

| Décision | Raison |
|----------|--------|
| Inline styles | Rapidité itération |
| Client-only map | Leaflet incompatible SSR |
| Pas de backend | Focus UX Alpha |
| BottomSheet custom | Contrôle UX mobile |
| Données Google Sheet | Itération rapide contenu |
| Reco locale | Pas de dépendance IA externe |

---

## 14. CONTRAINTES

- Mobile-first strict
- Aucun chargement lourd
- Aucune dépendance serveur
- Navigation instantanée
- États non persistés hors booking simulé
- Accessibilité basique (ARIA minimal)

---

## 15. POINTS SENSIBLES

| Zone | Risque |
|------|-------|
| BottomSheet | Scroll / drag / overlay |
| MapView | Performance Leaflet |
| RecoOverlay | Cohérence émotionnelle |
| Types reco | Désynchronisation Sheet |
| Inline styles | Duplication possible |

---

## 16. ÉTAT DU PROJET

Alpha UX avancé  
Architecture prête pour :

- Backend futur
- Auth future
- Système prestataire
- Calendrier réel
- Paiements différés
- IA de recommandation serveur
