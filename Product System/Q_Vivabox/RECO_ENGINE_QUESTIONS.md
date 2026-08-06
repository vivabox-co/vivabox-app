# RECO_ENGINE_QUESTIONS.md

## Purpose

This document defines the **exact user-facing questionnaire** used by the Vivabox recommendation engine (V2).

These questions are:
- fixed
- non-explanatory
- non-adaptive beyond defined branching
- strictly limited to 3 steps

Any modification of wording, order, or options **breaks alignment** with the engine logic.

---

## Global Rules

- Always exactly **3 questions**
- One question per screen
- No helper text
- No explanation
- No progress indicator
- No reformulation
- No dynamic copy generation
- No additional questions

---

## Q1 — Foundational Question (Fixed)

### Q1.text

¿Cómo te gusta que un momento te haga sentir?


### Q1.options

1. **Relajado, sin esfuerzo**  
   → engagement = `relajado`

2. **Activo, participando**  
   → engagement = `activo`

3. **Sacudido, fuera de lo habitual**  
   → engagement = `sacudido`

---

## Q2 — Adaptive Question (Depends on Q1 only)

---

### Q2-A — If Q1 = `relajado`

#### Q2-A.text

¿Qué tipo de calma buscas?


#### Q2-A.options

1. **Corporal, relajante**  
   → calma_tipo = `corporal`

2. **Ambiental, acogedora**  
   → calma_tipo = `ambiental`

3. **Interior, silenciosa**  
   → calma_tipo = `interior`

---

### Q2-B — If Q1 = `activo`

#### Q2-B.text

Cuando participas, prefieres algo…


#### Q2-B.options

1. **Mental, aprendiendo**  
   → participacion_tipo = `mental`

2. **Manual, haciendo**  
   → participacion_tipo = `manual`

3. **Técnico, concentrado**  
   → participacion_tipo = `tecnico`

---

### Q2-C — If Q1 = `sacudido`

#### Q2-C.text

Lo fuera de lo habitual te atrae si es…


#### Q2-C.options

1. **Mental, desafiante**  
   → sacudida_tipo = `mental`

2. **Sensorial, sorprendente**  
   → sacudida_tipo = `sensorial`

3. **Emocional, intenso**  
   → sacudida_tipo = `emocional`

---

## Q3 — Ambiguity Resolution (Binary)

Q3 always depends **only** on Q1.

---

### Q3-A — If Q1 = `relajado`

#### Q3-A.text

Esa calma la prefieres…


#### Q3-A.options

1. **En el cuerpo, soltando**  
   → resolucion = `cuerpo`

2. **En el entorno, estando**  
   → resolucion = `entorno`

---

### Q3-B — If Q1 = `activo`

#### Q3-B.text

En ese tipo de experiencia, disfrutas más…


#### Q3-B.options

1. **Creando, haciendo**  
   → resolucion = `crear`

2. **Comprendiendo, observando**  
   → resolucion = `comprender`

---

### Q3-C — If Q1 = `sacudido`

#### Q3-C.text

Ese impacto lo prefieres…


#### Q3-C.options

1. **Inmediato, en el momento**  
   → resolucion = `inmediato`

2. **Duradero, que deja huella**  
   → resolucion = `duradero`

---

## Absolute Constraints

❌ No Q4  
❌ No wording changes  
❌ No reordering  
❌ No merged options  
❌ No dynamic phrasing  
❌ No AI-generated copy  
❌ No explanation or justification  

These questions are **part of the engine**.

---

## Final Note

This questionnaire is not designed to:
- collect preferences
- understand the user
- personalize the system

It exists only to:
> **collapse uncertainty into a calm decision space.**

If a question feels like it needs explanation, the UX is wrong.