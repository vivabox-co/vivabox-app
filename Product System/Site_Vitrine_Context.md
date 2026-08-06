# SITE_VITRINE_CONTEXT.md

Contexte du site vitrine Vivabox (projet séparé, autre dossier).
Ce document résume ce que la web app bénéficiaire doit savoir du site qui la précède dans le parcours. Ne pas dupliquer au-delà de ça — pour le détail, ouvrir le repo du site (`Web Site/vivabox`, docs/00 à 10).

---

## 1. RÔLE DU SITE VITRINE

Le site vitrine vend le **cadeau** (la Vivabox physique). Il ne montre jamais le catalogue complet d'expériences ni les prix par expérience — seulement des "Ejemplos de experiencias" (mot obligatoire, jamais "catalogue").

Hiérarchie non négociable côté site : **Gift → Box → Experience**. Le site parle à l'**acheteur**, jamais au bénéficiaire — c'est le rôle de cette web app.

---

## 2. PARCOURS COMPLET

1. Acheteur commande une Vivabox sur le site (checkout Wompi).
2. Le bénéficiaire reçoit une Vivabox physique avec un **code d'activation unique**.
3. Le bénéficiaire clique "Activar" → arrive sur cette web app.
4. Cette web app gère toute la découverte, sélection et réservation d'expérience.

Le site vitrine n'a **aucune connaissance** du contenu de cette web app (pas de prix, pas d'expériences précises) — juste la promesse générale.

---

## 3. ÉTAT ACTUEL DU LIEN "ACTIVAR" (IMPORTANT)

⚠️ **Le lien n'est pas encore câblé.** Sur le site, les CTA "Activar mi box" / "Activar mi Vivabox" (`Navbar.tsx`, `Footer.tsx`) pointent vers `/proximamente` (page "bientôt disponible"), pas vers cette web app.

Côté web app, `/activar` (`app/activar/page.tsx`) est un écran statique — il ne lit aucun code d'activation depuis l'URL, il enchaîne juste vers `/activar/datos` au clic sur "Comenzar".

**Conséquence :** le mécanisme de transmission du code d'activation (query param ? saisie manuelle sur `/activar` ? deep link avec token ?) n'est décidé nulle part. À trancher avant de brancher les deux projets pour de vrai.

---

## 4. CONTRAINTES DE MARQUE À RESPECTER ICI AUSSI

Le site et la web app doivent rester cohérents visuellement et tonalement même si ce sont deux codebases séparées :

- Espagnol colombien, naturel, jamais bureaucratique.
- Mots à éviter : *exclusivo, lujo, condiciones*.
- Jamais de prix visibles pour le bénéficiaire (déjà respecté ici — cf. RecoOverlay, section 7 de `Ai_Product_Workflow.md`).
- Ton "transition émotionnelle calme", jamais "outil" ou "dashboard" — cette exigence existe déjà dans `Ai_Product_Workflow.md`, elle est cohérente avec le ton du site.

---

## 5. RÉFÉRENCE

Repo du site : `C:\Users\plume\Documents\LatiBox\Web Site\vivabox`
Doc miroir côté site : `docs/11_webapp-handoff.md`
