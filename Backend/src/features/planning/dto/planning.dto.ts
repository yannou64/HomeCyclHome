// DTOs de sortie — types simples, pas de décorateurs class-validator
// Ces types représentent ce que l'API retourne au frontend

export type ModelePlanificationDto = {
    id: string;
    technicien_id: string;
    zone_id: string;
    // 0=lundi, 1=mardi, 2=mercredi, 3=jeudi, 4=vendredi, 5=samedi, 6=dimanche
    jour_semaine: number;
    // Minutes depuis minuit : 510 = 8h30, 1020 = 17h00
    heure_debut: number;
    heure_fin: number;
    intervalle_minutes: number;
    is_actif: boolean;
    date_debut_validite: string; // ISO 8601
    date_fin_validite: string | null;
};

export type PauseRecurrenteDto = {
    id: string;
    technicien_id: string;
    // null = tous les jours, 0=lundi … 6=dimanche
    jour_semaine: number | null;
    heure_debut: number;
    heure_fin: number;
    description: string | null;
};

export type IndisponibiliteDto = {
    id: string;
    technicien_id: string;
    date_debut: string; // ISO 8601
    date_fin: string; // ISO 8601
    motif: string | null;
};

// Types intermédiaires utilisés par l'interface repository
// Séparés des DTOs d'entrée HTTP pour que le repository reste indépendant de NestJS

export type CreateModeleData = Omit<
    ModelePlanificationDto,
    'id' | 'date_debut_validite' | 'date_fin_validite'
> & {
    date_debut_validite: Date;
    date_fin_validite: Date | null;
};

export type UpdateModeleData = Partial<
    Omit<
        ModelePlanificationDto,
        'id' | 'technicien_id' | 'date_debut_validite' | 'date_fin_validite'
    > & {
        date_debut_validite: Date;
        date_fin_validite: Date | null;
    }
>;

export type CreatePauseData = Omit<PauseRecurrenteDto, 'id'>;

export type CreateIndisponibiliteData = {
    technicien_id: string;
    date_debut: Date;
    date_fin: Date;
    motif?: string;
};

// ── Créneaux ─────────────────────────────────────────────────────────────────

export type CreneauDto = {
    id: string;
    date_debut: string; // ISO 8601
    date_fin: string | null; // null à la génération, rempli à la réservation
    is_disponible: boolean;
    zone_id: string;
    modele_planification_id: string | null;
};

// Type intermédiaire utilisé par le repository findCreneauxByZone
// Étend CreneauDto avec technicien_id résolu depuis la relation modele_planification
// intervalleMinutes = durée d'un slot selon le modèle (utilisé pour vérifier la contiguïté des buffers)
export type CreneauAvecTechnicienDto = CreneauDto & {
    technicien_id: string | null;
    intervalleMinutes: number;
};

// Créneau retourné au client dans le tunnel de réservation
// date_fin est toujours renseigné (calculé : date_debut + dureeMinutes du forfait)
// technicien_id est le snapshot qui sera stocké sur l'intervention
export type CreneauDisponibleDto = {
    id: string;
    date_debut: string; // ISO 8601
    date_fin: string; // ISO 8601 — date_debut + dureeMinutes
    technicien_id: string | null; // null si créneau manuel (sans modèle de planification)
    zone_id: string;
};

// Réponse de l'endpoint POST /admin/planning/creneaux/generate
export type GenerationRapportDto = {
    created: number; // créneaux nouvellement insérés
    skipped: number; // slots sautés (pause, indisponibilité, doublon)
    conflicts: number; // créneaux is_disponible=false dans la période (déjà réservés)
};

// Données envoyées au repository pour créer un créneau (type interne, pas de décorateurs)
export type CreateCreneauData = {
    date_debut: Date; // Date native — Prisma attend une Date, pas un string ISO
    date_fin: null; // toujours null à la génération
    is_disponible: true; // toujours disponible à la génération
    zone_id: string;
    modele_planification_id: string;
};
