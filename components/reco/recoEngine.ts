// components/reco/recoEngine.ts

import { RecoExperience, RecoAnswers } from './recoTypes'

export function getTop3Experiences(
  experiences: RecoExperience[],
  answers: RecoAnswers
): RecoExperience[] {
  // STEP 1 — filter by engagement (soft filter)
  const sameEngagement = experiences.filter(
    e => e.engagement === answers.engagement
  )

  const pool = sameEngagement.length >= 3 ? sameEngagement : experiences

  // STEP 2 — scoring
  const scored = pool.map(exp => {
    let score = 0

    // Q1 — engagement (already matched if filtered)
    if (exp.engagement === answers.engagement) {
      score += 50
    }

    // Q2 — branch match
    if (
      answers.calma_tipo &&
      exp.calma_tipo === answers.calma_tipo
    ) {
      score += 30
    }

    if (
      answers.participacion_tipo &&
      exp.participacion_tipo === answers.participacion_tipo
    ) {
      score += 30
    }

    if (
      answers.sacudida_tipo &&
      exp.sacudida_tipo === answers.sacudida_tipo
    ) {
      score += 30
    }

    // Q3 — resolucion (signal only)
    if (
      answers.resolucion &&
      exp.resolucion === answers.resolucion
    ) {
      score += 20
    }

    return { exp, score }
  })

  // STEP 3 — sort
  scored.sort((a, b) => b.score - a.score)

  // STEP 4 — diversity guardrail (activity_key)
  const top3: RecoExperience[] = []
  const usedKeys = new Set<string>()

  for (const item of scored) {
    if (top3.length === 3) break
    if (usedKeys.has(item.exp.activity_key)) continue

    top3.push(item.exp)
    usedKeys.add(item.exp.activity_key)
  }

  // fallback if diversity blocks too much
  if (top3.length < 3) {
    for (const item of scored) {
      if (top3.length === 3) break
      if (!top3.includes(item.exp)) {
        top3.push(item.exp)
      }
    }
  }

  return top3.slice(0, 3)
}
