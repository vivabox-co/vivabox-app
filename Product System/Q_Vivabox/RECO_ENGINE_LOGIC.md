# RECO_ENGINE_LOGIC.md

## Purpose

This document defines the **exact decision logic** used to generate a Top 3 Vivabox experience recommendation (V2).

This engine is **deterministic and non-explanatory**.
Its sole purpose is to **reduce choice anxiety** by producing a coherent and reassuring short list.

It does **not** optimize relevance.
It does **not** explain itself.
It does **not** learn.

---

## Inputs

- A list of `Experience` objects conforming **strictly** to `RECO_ENGINE_SCHEMA.md`
- User answers to:
  - Q1 — foundational engagement
  - Q2 — experiential mode (branching)
  - Q3 — resolution of impact (binary)

---

## Step 1 — Map User Answers to Engine Values

### Q1 → engagement

| User Answer                               | engagement |
|------------------------------------------|------------|
| Relajado, sin esfuerzo                   | relajado   |
| Activo, participando                     | activo     |
| Sacudido, fuera de lo habitual           | sacudido   |

This value is **mandatory** and foundational.

---

### Q2 → engagement-specific dimension

Mapping depends **only** on Q1.

#### If `engagement === 'relajado'`

| User Answer                  | calma_tipo |
|-----------------------------|------------|
| Corporal, relajante          | corporal   |
| Ambiental, acogedora        | ambiental  |
| Interior, silenciosa        | interior   |

---

#### If `engagement === 'activo'`

| User Answer                  | participacion_tipo |
|-----------------------------|--------------------|
| Mental, aprendiendo          | mental             |
| Manual, haciendo             | manual             |
| Técnico, concentrado         | tecnico            |

---

#### If `engagement === 'sacudido'`

| User Answer                      | sacudida_tipo |
|----------------------------------|---------------|
| Mental, desafiante               | mental        |
| Sensorial, sorprendente          | sensorial     |
| Emocional, intenso               | emocional     |

---

### Q3 → resolucion

Mapping depends **only** on Q1.

#### If `engagement === 'relajado'`

| User Answer                        | resolucion |
|-----------------------------------|------------|
| En el cuerpo, soltando             | cuerpo     |
| En el entorno, estando             | entorno    |

---

#### If `engagement === 'activo'`

| User Answer                              | resolucion |
|------------------------------------------|------------|
| Creando, haciendo                        | crear      |
| Comprendiendo, observando                | comprender |

---

#### If `engagement === 'sacudido'`

| User Answer                              | resolucion |
|------------------------------------------|------------|
| Inmediato, en el momento                 | inmediato  |
| Duradero, que deja huella                | duradero   |

---

## Step 2 — Engagement Filtering

Filter the dataset to retain only experiences where:

experience.engagement === user.engagement


If fewer than **3** experiences remain:
- Keep the filtered set
- Continue without expanding the filter

Engagement is **never relaxed**.

---

## Step 3 — Scoring

Each remaining experience receives a score.

### Base score
score = 0


---

### Q1 — Engagement match (mandatory)

if experience.engagement === user.engagement:
score += 50


---

### Q2 — Mode match (branch-specific)

if engagement === 'relajado' and experience.calma_tipo === user.calma_tipo:
score += 30

if engagement === 'activo' and experience.participacion_tipo === user.participacion_tipo:
score += 30

if engagement === 'sacudido' and experience.sacudida_tipo === user.sacudida_tipo:
score += 30


---

### Q3 — Resolution match

if experience.resolucion === user.resolucion:
score += 20


---

### Scoring rules

- No negative scores
- No penalties
- No partial matches
- No inferred compatibility

---

## Step 4 — Sorting

Sort experiences by:

1. Total score (descending)
2. Stable random tie-breaker (to avoid repetition)

---

## Step 5 — Compose the Top 3

From the sorted list, select **exactly 3 experiences**, applying the following guardrails **in order**.

### 1. Anchor

- Highest score
- Full match on Q1
- Strongest overall coherence

---

### 2. Variation

- Same `engagement`
- Different `activity_key` than Anchor
- Slight divergence allowed on Q2 or Q3

---

### 3. Opening

- Same `engagement`
- Different experiential angle
- Still compatible with user answers
- Never contradictory

---

## Step 6 — Guardrails Enforcement

Before finalizing the Top 3:

### Format diversity
- **Forbid** 3 experiences sharing the same `activity_key`

If violated:
- Replace the lowest-ranked duplicate
- Preserve ranking order as much as possible

---

### Minimum coherence threshold

If an experience scores **< 50**:
- It must not displace a higher-scoring coherent option
- Neutral but engagement-consistent experiences are preferred

(No explicit threshold value is exposed in the UI.)

---

## Step 7 — Final Validation

Ensure:

- Exactly 3 experiences
- No duplicates
- Shared engagement
- Visible experiential diversity

If constraints cannot all be satisfied:
- Prioritize engagement consistency
- Then overall score

---

## Output

Return:

- An **ordered array of exactly 3 `Experience` objects**
- No explanation
- No labels
- No visible scoring
- No metadata leakage

---

## Absolute Rules

❌ No machine learning  
❌ No personalization memory  
❌ No analytics or feedback loop  
❌ No adaptive weighting  
❌ No confidence score  
❌ No explanation UI  

---

## Final Note

This engine is not trying to be optimal.

It is trying to feel **obvious**, **calm**, and **safe**.

If a result feels wrong:

**Fix the dataset.**

Do **NOT** fix this logic.