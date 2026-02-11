# COMPONENT_LOGIC.md

Ce document décrit la logique fonctionnelle des composants clés de la web app bénéficiaire Vivabox.

Objectif :  
Permettre à un développeur ou une IA de comprendre **qui fait quoi**, **où se trouve la logique**, et **ce qui est purement visuel vs métier**.

---

## 1. PHILOSOPHIE GÉNÉRALE

L’architecture suit une règle :

> **Les pages orchestrent. Les composants exécutent.**

Les composants :
- ne contiennent pas de logique métier complexe
- reçoivent des données propres
- affichent
- déclenchent des actions

---

## 2. UIContext (Global UI State)

**Fichier :** `components/ui/UIContext`

### Rôle
Gère l’état d’interface partagé.

### États globaux :

| State | Rôle |
|------|------|
| `selectedExperience` | Expérience active dans un sheet |
| `drawerOpen` | Ouverture du BottomSheet |
| `hideNav` | Masquer la bottom navigation |

### Logique
- Aucun traitement métier
- Pure gestion d’interface

---

## 3. BottomSheet

**Fichier :** `components/ui/BottomSheet`

### Rôle
Conteneur dynamique pour :
- fiche expérience
- fiche réservation
- autres contenus contextuels

### Responsabilités :

| Fonction | Description |
|----------|------------|
| Hauteur dynamique | 50% → 80% écran |
| Drag vertical | Contrôle hauteur |
| Priorité expansion | Sheet s’ouvre avant scroll |
| Scroll interne | Contenu défile seulement à hauteur max |
| Footer fixe | CTA toujours visible |

### Ne fait PAS :
- Chargement données
- Logique métier

---

## 4. MapView

**Fichier :** `components/map/MapView`

### Rôle
Affichage carte Leaflet.

### Reçoit :
- filtres actifs
- callback `onSelect(exp)`

### Logique :
- Filtrage déjà fait en amont
- Affiche pins par catégorie
- Couleurs issues de `categoryColors`

---

## 5. ExperienceExploreMeta

**Fichier :** `components/experience/ExperienceExploreMeta`

### Rôle
Fiche expérience pour exploration (mapa / lista / favoritos)

### Affiche :
- image
- catégorie
- titre
- projection
- sections : incluye, ideal, important
- CTA (via footer BottomSheet)

### Logique :
- Aucun calcul
- Affichage conditionnel sections si données présentes

---

## 6. ExperienceBookedContent

**Fichier :** `components/experience/ExperienceBookedContent`

### Rôle
Fiche expérience version **réservation en cours**

### Différences avec ExploreMeta :

| Élément | Condition |
|--------|-----------|
| Prestataire | Visible si confirmé |
| Infos lieu | Visible si confirmé |
| Message neutre | Avant confirmation |

### Logique :
- `isConfirmed = status === "confirmed" || "done"`

---

## 7. ExperienceSummaryCard

**Fichier :** `components/list/ExperienceSummaryCard`

### Rôle
Carte compacte utilisée dans :
- Lista
- Favoritos
- Seguimiento

### Fonction :
- Affiche snapshot
- Ouvre sheet via onClick

---

## 8. FiltersDrawer

**Fichier :** `components/filters/FiltersDrawer`

### Rôle
Interface filtres exploration.

### Ne filtre pas lui-même.
Il déclenche des setters passés par la page.

---

## 9. BookingTimeline

**Fichier :** `components/ui/BookingTimeline`

### Rôle
Visualisation état réservation.

### Purement visuel.
Statut fourni par page.

---

## 10. DynamicStatusBlock

Affiche texte dynamique selon statut.

---

## 11. Pages = couche logique

Les pages font :
- fetch données
- filtrage
- orchestration UIContext
- routing

Les composants :
> **n’ont pas connaissance du système global**

---

## 12. SÉPARATION CLAIRE

| Niveau | Rôle |
|-------|------|
| Pages | logique, données |
| Components | rendu |
| UIContext | état interface |
| lib/ | logique produit |

---

## 13. RÈGLE CRITIQUE

Si un composant :
- fetch
- filtre
- transforme

→ mauvaise architecture.
