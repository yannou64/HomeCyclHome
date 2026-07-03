export type ModelePlanification = {
  id: string;
  technicienId: string;
  zoneId: string;
  jourSemaine: number;          // 0=lundi … 6=dimanche
  heureDebut: number;           // minutes depuis minuit (ex: 510 = 8h30)
  heureFin: number;
  intervalleMinutes: number;
  isActif: boolean;
  dateDebutValidite: string;    // ISO 8601
  dateFinValidite: string | null;
};

export type CreateModelePlanificationPayload = {
  technicienId: string;
  zoneId: string;
  jourSemaine: number;
  heureDebut: number;
  heureFin: number;
  intervalleMinutes: number;
  isActif: boolean;
  dateDebutValidite: string;
  dateFinValidite: string | null;
};

export type UpdateModelePlanificationPayload = Partial<CreateModelePlanificationPayload>;

export type PauseRecurrente = {
  id: string;
  technicienId: string;
  jourSemaine: number | null;   // null = tous les jours
  heureDebut: number;
  heureFin: number;
  description: string | null;
};

export type CreatePauseRecurrentePayload = {
  technicienId: string;
  jourSemaine?: number | null;
  heureDebut: number;
  heureFin: number;
  description?: string | null;
};

export type Indisponibilite = {
  id: string;
  technicienId: string;
  dateDebut: string;   // ISO 8601
  dateFin: string;
  motif: string | null;
};

export type CreateIndisponibilitePayload = {
  technicienId: string;
  dateDebut: string;
  dateFin: string;
  motif?: string | null;
};

// ── Créneaux ──────────────────────────────────────────────────────────────────

export type Creneau = {
  id: string;
  dateDebut: string;                // ISO 8601
  dateFin: string | null;           // null à la génération, rempli à la réservation
  isDisponible: boolean;
  zoneId: string;
  modelePlanificationId: string | null;
};

export type GenerateCreneauxPayload = {
  modeleId: string;
  dateFinGeneration?: string;       // borne exclusive (ISO date) — optionnel
};

export type GenerateAllCreneauxPayload = {
  technicienId: string;
  dateFinGeneration?: string;
};

export type GenerationRapport = {
  created: number;
  skipped: number;
  conflicts: number;
};
