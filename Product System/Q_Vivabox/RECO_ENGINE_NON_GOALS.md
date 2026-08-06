# RECO_ENGINE_NON_GOALS.md

## Purpose

This document defines **what the recommendation engine must NOT do**.

These constraints are as important as the logic itself.
Violating any of them breaks the product experience.

---

## The Engine Is NOT

- ❌ A booking engine
- ❌ A discovery engine
- ❌ A personalization system
- ❌ A support or help feature
- ❌ A ranking or scoring product
- ❌ A learning or adaptive system

The engine exists solely to:
> Reduce choice anxiety and help the user move forward calmly.

---

## Absolute Non-Goals

### Intelligence & Optimization
- ❌ No machine learning
- ❌ No AI explanations
- ❌ No confidence or probability scores
- ❌ No relevance metrics
- ❌ No continuous improvement loop

---

### Data & State
- ❌ No persistent user profile
- ❌ No memory across sessions
- ❌ No cross-user learning
- ❌ No hidden state
- ❌ No saving answers automatically

---

### UX & Interface
- ❌ No explanation of how recommendations are generated
- ❌ No “why this was suggested”
- ❌ No instructional text
- ❌ No tooltips
- ❌ No progress indicators
- ❌ No badges, labels, or scores

---

### Behavior
- ❌ No auto-trigger
- ❌ No nudging
- ❌ No urgency messaging
- ❌ No gamification
- ❌ No optimization toward conversion

---

### Engineering
- ❌ No backend dependency
- ❌ No analytics tracking
- ❌ No A/B testing
- ❌ No feature flags
- ❌ No logging beyond error handling

---

## What To Do If Something Feels Wrong

If during implementation:
- a recommendation feels odd
- a result seems repetitive
- a Top 3 lacks variety

### The only valid action:
- Fix the dataset

### Forbidden actions:
- Tweaking weights
- Adding conditions
- Introducing heuristics
- “Improving” the logic

---

## Final Warning

This engine relies on **restraint**, not sophistication.

Any attempt to be smarter than this document
will make the experience worse.

Read twice.
Implement once.
