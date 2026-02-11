# BEHAVIOR_SYSTEM.md

Ce document décrit **le comportement dynamique** de la web app bénéficiaire Vivabox.  
Pas le design. Pas les composants.  
Seulement : **comment l’app réagit, évolue et guide l’utilisateur.**

---

## 1. PHILOSOPHIE COMPORTEMENTALE

L’application suit un principe clé :

> **Le système s’adapte à l’utilisateur, jamais l’inverse.**

Le comportement doit :
- être fluide
- ne jamais bloquer
- ne jamais exposer la complexité
- toujours donner le sentiment que tout avance

---

## 2. STRUCTURE MENTALE DU FLOW

| Étape | État mental utilisateur | Comportement système |
|------|-------------------------|----------------------|
| Welcome | Curiosité | Rien à configurer |
| Activation | Légère incertitude | Forme ultra simple |
| Activado | Soulagement | Vision globale claire |
| Exploration | Liberté | Abondance visible |
| Sélection | Projection | Sheet immersif |
| Date | Légère crainte | Rassurance implicite |
| Après proposition | Attente | Sentiment que ça avance |

---

## 3. BOTTOM SHEET BEHAVIOR

### Règle centrale :

> Le sheet est un espace de **projection**, pas un panneau technique.

### Comportement :

| Action utilisateur | Réaction du sheet |
|--------------------|-------------------|
| Ouvre | Hauteur 50% |
| Scroll vers haut | Sheet monte à 80% AVANT scroll contenu |
| À 80% | Contenu commence à scroller |
| Scroll vers bas en haut du contenu | Sheet redescend |
| Tap overlay | Ferme |
| CTA visible | Toujours |

---

## 4. NAVIGATION BEHAVIOR

| Situation | Nav |
|----------|-----|
| Exploration | Nav visible |
| Activation | Nav cachée |
| Réservation | Nav visible |
| Sheet ouvert | Nav reste visible mais CTA sheet au-dessus |

---

## 5. FEEDBACK UTILISATEUR

Le système doit toujours répondre :

| Action | Feedback |
|--------|----------|
| Click carte | Sheet s’ouvre instantanément |
| Click CTA | Navigation immédiate |
| Activation code | Transition fluide |
| Proposer date | Écran de confirmation rassurant |

---

## 6. PERCEPTION DE PROGRESSION

Le système doit **donner le sentiment d’avancer** sans engagement :

| Composant | Rôle comportemental |
|-----------|---------------------|
| Timeline | Montre que ça progresse |
| StatusBlock | Explique sans complexité |
| Messages | Toujours rassurants |

---

## 7. FILTRES BEHAVIOR

| Action | Comportement |
|--------|--------------|
| Activer filtre | Résultat immédiat |
| Aucune correspondance | Jamais affiché |
| Tout visible | Toujours valide |

---

## 8. ERREURS — GESTION INVISIBLE

En alpha :
- pas de vrais échecs
- tout semble fonctionner

But :
> Ne jamais casser l’illusion d’un système maîtrisé.

---

## 9. ÉTAT SYSTÈME PERÇU

L’utilisateur doit sentir que :

- tout est déjà prévu
- il n’a rien à comprendre
- il ne peut pas se tromper

---

## 10. PRIORITÉ ABSOLUE

Si un comportement donne :

- friction
- attente
- doute
- question technique

→ mauvais comportement UX.

---

## 11. RÈGLE FONDAMENTALE

> Le système ne doit jamais demander un effort cognitif.

---

## 12. INDICATEUR DE RÉUSSITE

Si l’utilisateur pense :

> “Ah ok, c’est simple.”

Alors le comportement est correct.
