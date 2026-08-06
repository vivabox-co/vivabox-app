// components/reco/recoTypes.ts

import type { Experience as ProductExperience } from '@/lib/data/types'

/* ================== RECO AXES ================== */

export type Engagement = 'relajado' | 'activo' | 'sacudido'

export type CalmaTipo = 'corporal' | 'ambiental' | 'interior'
export type ParticipacionTipo = 'mental' | 'manual' | 'tecnico'
export type SacudidaTipo = 'mental' | 'sensorial' | 'emocional'

export type Resolucion =
  | 'cuerpo'
  | 'entorno'
  | 'crear'
  | 'comprender'
  | 'inmediato'
  | 'duradero'

/* ================== RECO EXPERIENCE ================== */
/**
 * RecoExperience
 * = Experience produit Vivabox
 * + métadonnées de recommandation
 */
export type RecoExperience = ProductExperience & {
  engagement?: Engagement

  calma_tipo?: CalmaTipo
  participacion_tipo?: ParticipacionTipo
  sacudida_tipo?: SacudidaTipo

  resolucion?: Resolucion
}

/* ================== ANSWERS ================== */

export type RecoAnswers = {
  engagement?: Engagement   // 👈 DEVIENT OPTIONNEL
  calma_tipo?: CalmaTipo
  participacion_tipo?: ParticipacionTipo
  sacudida_tipo?: SacudidaTipo
  resolucion?: Resolucion
}

