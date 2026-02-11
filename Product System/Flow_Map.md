# FLOW_MAP.md

Cartographie complète du flow bénéficiaire Vivabox.  
Vue systémique — logique émotionnelle + comportementale + perception de contrôle.

---

## 1. VUE GLOBALE

Objet physique → Code → Activation → Projection → Exploration → Sélection → **Préférences de date** → Coordination invisible

Le système transforme :

**Boîte reçue → Moment futur imaginé**

⚠️ Le bénéficiaire ne "réserve" jamais.  
Il **exprime des préférences**.  
Vivabox orchestre.

---

## 2. FLOW PRINCIPAL

| Étape | Route | État mental | Rôle UX | Action utilisateur |
|------|------|-------------|---------|--------------------|
| 1 | `/welcome` | Surprise | Accueil émotionnel | Regarde |
| 2 | `/activar` | Curiosité | Geste simple | Entre code |
| 3 | `/activado` | Soulagement | Vision du parcours | Comprend |
| 4 | `/mapa` ou `/lista` | Liberté | Explorer | Parcourt |
| 5 | BottomSheet | Projection | Se voir vivre | Lit |
| 6 | CTA choisir | Décision douce | Continuer | Clique |
| 7 | `/reservar/fechas` | Légère crainte | **Redonner contrôle** | Indique jours + horaire |
| 8 | `/confirmacion` | Apaisement | Vivabox prend relais | Comprend que c’est en cours |
| 9 | `/seguimiento` | Confiance | Attente maîtrisée | Suit progression |

---

## 3. LOGIQUE ÉMOTIONNELLE

| Phase | But |
|------|-----|
| Accueil | Réduire incertitude |
| Activation | Engagement doux |
| Vision globale | Supprimer peur du système |
| Exploration | Créer désir |
| Fiche expérience | Projection mentale |
| **Préférences date/heure** | Donner contrôle sans engagement |
| Confirmation | Montrer que Vivabox agit |
| Suivi | Maintenir confiance |

---

## 4. ÉTAPE CRITIQUE : PRÉFÉRENCES DE DATE

⚠️ Ce n’est PAS une réservation.  
C’est un **moment psychologique clé** : l’utilisateur s’imagine vraiment vivre l’expérience.

### Objectifs UX de cette étape

- Renforcer projection
- Réduire anxiété
- Éviter pression
- Donner sensation de contrôle
- Rendre la coordination invisible

---

### 4.1 LOGIQUE DE SÉLECTION JOURS

| Principe | Raison |
|---------|-------|
| Sélection directe dans calendrier | Naturel, universel |
| Maximum 3 dates | Liberté sans surcharge cognitive |
| Zone stable “Tus días elegidos” | Évite déformation UI |
| Pas de boutons "flexibilité ± jours" | Logique système ≠ logique utilisateur |
| CTA neutre | Pas d’impression de validation ferme |

---

### 4.2 LOGIQUE DE SÉLECTION HORAIRE

| Élément | Rôle psychologique |
|--------|-------------------|
| Moment du jour (mañana / tarde / noche) | Facile, faible effort |
| Bouton "Indicar hora" | Pour profils précis |
| Horaire principal | Sentiment de décision |
| Horaire alternatif (optionnel) | Flexibilité sans le dire |
| Alternative visuellement secondaire | Le choix principal reste dominant |
| Interdiction de conflit horaire | Évite friction cognitive |

L’utilisateur a l’impression :
> “Je choisis.”  
Le système lit :
> “Fenêtre de coordination.”

---

## 5. FLOW ALTERNATIFS

### A. Exploration libre
Peut explorer sans proposer de date.  
Maintient liberté perçue.

### B. Retour arrière
Peut changer d’expérience à tout moment.  
Aucun verrouillage.

### C. Coordination invisible
Préférences → Vivabox contacte prestataire → Ajustement interne → Confirmation ultérieure

---

## 6. FLOW INVISIBLE (SYSTÈME)

Jamais visible :

- Disponibilités réelles
- Conflits planning
- Négociations
- Quotas
- Paiements
- Anti-fraude

L’UX montre :
> “On s’occupe de tout.”

---

## 7. MOMENTS À RISQUE

| Moment | Risque UX |
|--------|-----------|
| Activation | Peut ressembler à inscription |
| Fiche expérience | Peut ressembler à produit e-commerce |
| Préférences date/heure | Peut ressembler à réservation ferme |
| Suivi | Peut ressembler à SAV |

---

## 8. RÈGLE DE CONTINUITÉ

Chaque écran répond à :

> “Qu’est-ce que je fais maintenant ?”

Sans tunnel, sans pression.

---

## 9. POINT D’OR DU FLOW

Le moment où l’utilisateur pense :

> “Je me vois déjà là-bas.”

La date + l’heure déclenchent ce basculement mental.

---

## 10. FLOW TECHNIQUE (ALPHA)

Code → UI state → Experience chosen → Dates[] + Times[] → Local state → Écran confirmation → Simulation coordination

Pas de persistance réelle en Alpha.

---

## 11. RÈGLE ABSOLUE

Le flow ne doit jamais ressembler à :

- Achat
- Réservation d’hôtel
- Billetterie
- Marketplace

Vivabox = cadeau qui se déplie.
