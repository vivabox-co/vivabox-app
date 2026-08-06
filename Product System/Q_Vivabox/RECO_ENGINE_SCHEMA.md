# RECO_ENGINE_SCHEMA.md

## Purpose

This document defines the **strict data contract** used by the Vivabox recommendation engine (V2).

This schema is **authoritative**.
Any deviation, extension, inference, or enrichment outside this contract is forbidden.

The recommendation engine works **only** with the fields defined below.

---

## Core Entity: Experience

Each experience must be represented as a flat object with fixed attributes.

```ts
type Experience = {
  id: string
  activity_key: string

  engagement: 'relajado' | 'activo' | 'sacudido'

  calma_tipo?: 'corporal' | 'ambiental' | 'interior'

  participacion_tipo?: 'mental' | 'manual' | 'tecnico'

  sacudida_tipo?: 'mental' | 'sensorial' | 'emocional'

  resolucion?:
    | 'cuerpo'
    | 'entorno'
    | 'crear'
    | 'comprender'
    | 'inmediato'
    | 'duradero'
}
Field Definitions
id
Unique identifier of the experience.

Comes directly from the curated dataset

Must be stable

Must not be transformed or derived

activity_key
High-level structural category of the experience.

Examples (non-exhaustive):

dining

taller_gastro

eco_lodge

glamping

aventura

teatro

foto

Rules:

Free string

Used only for diversity guardrails

No scoring logic depends directly on this field

engagement
Represents the foundational experiential mode of the experience.

Allowed values:

relajado → calm, effortless, soothing

activo → participative, engaging, intentional

sacudido → disruptive, intense, out of the ordinary

Rules:

Mandatory

Primary discriminator

Mapped directly from Q1

calma_tipo
Specifies the type of calm provided by a relajado experience.

Allowed values:

corporal → physical relaxation

ambiental → atmosphere, environment

interior → mental or emotional quiet

Rules:

Optional

Only meaningful if engagement === 'relajado'

Must not be used for other engagement types

Mapped from Q2 (relajado branch)

participacion_tipo
Specifies the mode of participation in an activo experience.

Allowed values:

mental → learning, understanding

manual → hands-on, making

tecnico → precision, concentration

Rules:

Optional

Only meaningful if engagement === 'activo'

Must not be used for other engagement types

Mapped from Q2 (activo branch)

sacudida_tipo
Specifies the nature of impact in a sacudido experience.

Allowed values:

mental → cognitive challenge

sensorial → sensory disruption

emocional → emotional intensity

Rules:

Optional

Only meaningful if engagement === 'sacudido'

Must not be used for other engagement types

Mapped from Q2 (sacudido branch)

resolucion
Represents where or how the experience resolves its impact.

Allowed values:

cuerpo

entorno

crear

comprender

inmediato

duradero

Rules:

Optional

Descriptive, not prescriptive

Never used as a hard validation rule

Used only as a scoring signal in the recommendation engine

No combination with engagement is considered invalid

Mapped from Q3

Absolute Rules
❌ No additional fields allowed
❌ No computed fields
❌ No inferred values
❌ No mutation at runtime
❌ No front-end enrichment
❌ No backend override

The engine consumes this schema.
It does not modify it.

Source of Truth
The single source of truth is the curated dataset
(Google Sheet → static export).

If a result feels wrong:

Fix the dataset

Do NOT fix the algorithm.

Final Note
This schema is designed to:

Encode experiential intent explicitly

Support a deterministic, explainable-free recommendation engine

Preserve the illusion of emotional simplicity

Any attempt to enforce “smart” validation rules at the schema level
will break alignment with the engine and the product intent.