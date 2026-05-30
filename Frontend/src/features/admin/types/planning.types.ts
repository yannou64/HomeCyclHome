export type ModelePlanification = {
  id: string;
  technicien_id: string;
  zone_id: string;
  jour_semaine: number;         // 0=lundi … 6=dimanche
  heure_debut: number;          // minutes depuis minuit (ex: 510 = 8h30)
  heure_fin: number;
  intervalle_minutes: number;
  is_actif: boolean;
  date_debut_validite: string;  // ISO 8601
  date_fin_validite: string | null;
};

export type CreateModelePlanificationPayload = {
  technicien_id: string;
  zone_id: string;
  jour_semaine: number;
  heure_debut: number;
  heure_fin: number;
  intervalle_minutes: number;
  is_actif: boolean;
  date_debut_validite: string;
  date_fin_validite: string | null;
};

export type UpdateModelePlanificationPayload = Partial<CreateModelePlanificationPayload>;

export type PauseRecurrente = {
  id: string;
  technicien_id: string;
  jour_semaine: number | null;  // null = tous les jours
  heure_debut: number;
  heure_fin: number;
  description: string | null;
};

export type CreatePauseRecurrentePayload = {
  technicien_id: string;
  jour_semaine?: number | null;
  heure_debut: number;
  heure_fin: number;
  description?: string | null;
};

export type Indisponibilite = {
  id: string;
  technicien_id: string;
  date_debut: string;  // ISO 8601
  date_fin: string;
  motif: string | null;
};

export type CreateIndisponibilitePayload = {
  technicien_id: string;
  date_debut: string;
  date_fin: string;
  motif?: string | null;
};

// ── Créneaux ──────────────────────────────────────────────────────────────────

export type Creneau = {
  id: string;
  date_debut: string;               // ISO 8601
  date_fin: string | null;          // null à la génération, rempli à la réservation
  is_disponible: boolean;
  zone_id: string;
  modele_planification_id: string | null;
};

export type GenerateCreneauxPayload = {
  modele_id: string;
  date_fin_generation?: string;     // borne exclusive (ISO date) — optionnel
};

export type GenerateAllCreneauxPayload = {
  technicien_id: string;
  date_fin_generation?: string;
};

export type GenerationRapport = {
  created: number;
  skipped: number;
  conflicts: number;
};