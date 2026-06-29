// DTOs de sortie — types simples, pas de décorateurs class-validator
// Ces types représentent ce que l'API retourne au frontend

export type ModelePlanificationDto = {
    id: string;
    technicienId: string;
    zoneId: string;
    // 0=lundi, 1=mardi, 2=mercredi, 3=jeudi, 4=vendredi, 5=samedi, 6=dimanche
    jourSemaine: number;
    // Minutes depuis minuit : 510 = 8h30, 1020 = 17h00
    heureDebut: number;
    heureFin: number;
    intervalleMinutes: number;
    isActif: boolean;
    dateDebutValidite: string; // ISO 8601
    dateFinValidite: string | null;
};

export type PauseRecurrenteDto = {
    id: string;
    technicienId: string;
    // null = tous les jours, 0=lundi … 6=dimanche
    jourSemaine: number | null;
    heureDebut: number;
    heureFin: number;
    description: string | null;
};

export type IndisponibiliteDto = {
    id: string;
    technicienId: string;
    dateDebut: string; // ISO 8601
    dateFin: string; // ISO 8601
    motif: string | null;
};

// Types intermédiaires utilisés par l'interface repository
// Séparés des DTOs d'entrée HTTP pour que le repository reste indépendant de NestJS

export type CreateModeleData = Omit<
    ModelePlanificationDto,
    'id' | 'dateDebutValidite' | 'dateFinValidite'
> & {
    dateDebutValidite: Date;
    dateFinValidite: Date | null;
};

export type UpdateModeleData = Partial<
    Omit<
        ModelePlanificationDto,
        'id' | 'technicienId' | 'dateDebutValidite' | 'dateFinValidite'
    > & {
        dateDebutValidite: Date;
        dateFinValidite: Date | null;
    }
>;

export type CreatePauseData = Omit<PauseRecurrenteDto, 'id'>;

export type CreateIndisponibiliteData = {
    technicienId: string;
    dateDebut: Date;
    dateFin: Date;
    motif?: string;
};

// ── Créneaux ─────────────────────────────────────────────────────────────────

export type CreneauDto = {
    id: string;
    dateDebut: string; // ISO 8601
    dateFin: string | null; // null à la génération, rempli à la réservation
    isDisponible: boolean;
    zoneId: string;
    modelePlanificationId: string | null;
};

// Type intermédiaire utilisé par le repository findCreneauxByZone
// Étend CreneauDto avec technicienId résolu depuis la relation modele_planification
// intervalleMinutes = durée d'un slot selon le modèle (utilisé pour vérifier la contiguïté des buffers)
export type CreneauAvecTechnicienDto = CreneauDto & {
    technicienId: string | null;
    intervalleMinutes: number;
};

// Créneau retourné au client dans le tunnel de réservation
// dateFin est toujours renseigné (calculé : dateDebut + dureeMinutes du forfait)
// technicienId est le snapshot qui sera stocké sur l'intervention
export type CreneauDisponibleDto = {
    id: string;
    dateDebut: string; // ISO 8601
    dateFin: string; // ISO 8601 — dateDebut + dureeMinutes
    technicienId: string | null; // null si créneau manuel (sans modèle de planification)
    zoneId: string;
};

// Réponse de l'endpoint POST /admin/planning/creneaux/generate
export type GenerationRapportDto = {
    created: number; // créneaux nouvellement insérés
    skipped: number; // slots sautés (pause, indisponibilité, doublon)
    conflicts: number; // créneaux isDisponible=false dans la période (déjà réservés)
};

// Données envoyées au repository pour créer un créneau (type interne, pas de décorateurs)
export type CreateCreneauData = {
    dateDebut: Date; // Date native — Prisma attend une Date, pas un string ISO
    dateFin: null; // toujours null à la génération
    isDisponible: true; // toujours disponible à la génération
    zoneId: string;
    modelePlanificationId: string;
};
