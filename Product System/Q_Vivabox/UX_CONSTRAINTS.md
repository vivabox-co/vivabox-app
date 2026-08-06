# UX_CONSTRAINTS.md

## Purpose

This document defines **where**, **how**, and **under what constraints** the recommendation system lives inside the Vivabox beneficiary web app.

These rules are **non-negotiable**.
They exist to preserve simplicity, emotional calm, and illusion of effortlessness.

---

## Entry Point

- The system is accessible **only** via a voluntary user action
- Trigger: click on the Vivabox logo
- Location: top-right of the header
- The logo:
  - is always visible
  - is never animated
  - has no tooltip
  - has no “help” or explanatory label

The logo suggests **presence**, not assistance.

---

## Allowed Pages

The overlay can be opened **only** from:
- Mapa
- Lista
- Fechas

It must not exist on any other page.

---

## Overlay Behavior

### Type
- Light overlay (centered or bottom sheet depending on viewport)
- One single component reused everywhere

### Size
- Mobile: full width
- Desktop: max-width 420px
- Height: auto
- Never more than 45% of viewport height

### Background
- Pure white
- Border radius: 20–24px
- Shadow: very soft (8–10% opacity)

---

## Background Interaction

- When the overlay is open:
  - the underlying page remains visible
  - the background is lightly blurred
  - all background interactions are disabled

The background must feel **present but inert**.

---

## Closing Rules

- Tap anywhere outside the overlay → closes
- Tap inside non-interactive area → closes
- No close button
- No “X”
- No explicit CTA to dismiss

Closing must feel natural, not intentional.

---

## Internal States (Strict)

The overlay supports **only** the following states:

1. `idle`
2. `q1`
3. `q2`
4. `q3`
5. `top3`
6. `detail`

No other states are allowed.

No branching outside this sequence.

---

## Questionnaire UX Rules

- One question per screen
- Three options per question
- One selection only
- No back navigation during Q1–Q3
- No progress indicator
- No explanation text
- No helper copy

The user should answer instinctively.

---

## Top 3 Display

- The Top 3 appears **inside the same overlay**
- Format: three recommendation cards
- This is an **assumed result**, not a suggestion

The system does not apologize, justify, or explain.

---

## Detail View

- Clicking a recommendation opens its detail **inside the overlay**
- The background page (map/list) does NOT change
- A return to the Top 3 is always possible

Navigation remains contained.

---

## Refresh Behavior

- The user can choose to restart the questionnaire
- Restarting triggers a confirmation message:
  - “Tus recomendaciones actuales se perderán”
- Before restarting:
  - the user may optionally save any number of the Top 3 as favorites
- Saved items persist independently of the questionnaire

---

## State Persistence

- The last generated Top 3 persists while the page session is active
- Reopening the overlay shows the last Top 3
- No cross-session persistence
- No memory across days or devices

---

## Animation Rules

- All animations must be minimal
- No looping
- No attention-grabbing motion
- No decorative transitions

Motion must never draw attention to itself.

---

## Absolute Prohibitions

If any of the following occur, the implementation is invalid:

- ❌ Explaining how recommendations work
- ❌ Showing scores, logic, or reasoning
- ❌ Adding help text or onboarding
- ❌ Using emojis or illustrations
- ❌ Making the overlay scrollable
- ❌ Triggering the overlay automatically
- ❌ Adding analytics or tracking hooks
- ❌ Adding urgency or persuasion copy

---

## Final Principle

This system must feel like:

> “Something that quietly helps, without ever saying it does.”

If the UX feels clever, it is wrong.
If it feels obvious, it is right.
