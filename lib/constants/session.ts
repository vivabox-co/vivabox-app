// Durée de vie d'une session, glissante : à chaque visite protégée (voir
// /api/codigo/context, appelé par le middleware), la session est prolongée
// de SESSION_VALIDITY_DAYS si elle entre dans la fenêtre de renouvellement —
// donc tant que le bénéficiaire revient au moins une fois tous les
// SESSION_VALIDITY_DAYS jours, il ne se fait jamais déconnecter.
export const SESSION_VALIDITY_DAYS = 30

// On ne réécrit expires_at que si la session entre dans sa seconde moitié de
// vie, pas à chaque requête — pour éviter un UPDATE Supabase sur chaque
// navigation d'un utilisateur actif.
export const SESSION_RENEWAL_THRESHOLD_DAYS = SESSION_VALIDITY_DAYS / 2
