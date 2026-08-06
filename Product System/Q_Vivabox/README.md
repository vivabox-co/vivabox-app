# Vivabox — Recommendation Engine Handoff

## Purpose

This handoff defines the implementation of a **lightweight recommendation engine** inside the Vivabox beneficiary web app.

The goal is **not** to optimize relevance.
The goal is to **reduce choice anxiety** and help the user move forward calmly.

This system must feel:
- obvious
- natural
- non-technical
- non-explanatory

If the user ever wonders *“how does this work?”*, the system has failed.

---

## Product Context (Non-Negotiable)

Vivabox is:
- not a booking tool
- not a marketplace
- not a support interface

Vivabox is:
- an emotional journey
- an invisible facilitator
- a system designed to reduce uncertainty without explaining anything

The user must **never** feel they are interacting with a system.

---

## What You Are Building

You are implementing:

- A **3-question questionnaire** (Q1 → Q2 → Q3)
- Followed by a **Top 3 experience recommendation**
- Displayed inside a **single overlay component**
- Accessible via a voluntary user action

No other entry point exists.

---

## What You Are NOT Building

You are **not** building:
- personalization
- user profiling
- analytics
- machine learning
- scoring UI
- explanations
- onboarding
- tooltips
- conversion optimizations

Do not add anything that is not explicitly requested.

---

## Files in This Handoff

This folder contains everything you need.

You must not infer, guess, or improve anything beyond it.

- `RECO_ENGINE_SCHEMA.md`  
  → Data contract (what you can manipulate)

- `RECO_ENGINE_LOGIC.md`  
  → Exact algorithm to generate the Top 3

- `RECO_ENGINE_NON_GOALS.md`  
  → Absolute constraints and forbidden behaviors

- `QUESTIONS_Q1_Q2_Q3.txt`  
  → Fixed user-facing wording

- `DATASET_EXPERIENCES.csv`  
  → Single source of truth for experiences

- `UX_CONSTRAINTS.md`  
  → Where and how this lives in the app

---

## Technical Scope

- Frontend-only logic
- No backend dependency
- No persistent state
- No tracking
- No A/B testing
- No feature flags

If something feels wrong during implementation:
- adjust the dataset
- **do not adjust the logic**

---

## Implementation Philosophy

This system relies on:
- restraint
- simplicity
- consistency

It is intentionally limited.

Any attempt to make it “smarter” will make it worse.

---

## Success Criteria

After seeing the Top 3, the user should think:

> “Ok. Now I can choose.”

They should **not** think:
- “Why these?”
- “How was this calculated?”
- “Did I answer correctly?”

---

## Final Instruction

Read all documents **before writing any code**.

If anything seems ambiguous:
- stop
- ask
- do not assume

This is a design-led system.
Your role is execution.

Thank you.
