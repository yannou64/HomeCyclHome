import type { CouleurZone } from '../../../shared/utils/couleursZones';

// Planning V2 — modèles de planification d'un technicien.
// Les heures circulent en minutes depuis minuit : 480 = 8h00.

export const JOURS_SEMAINE = [
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
    'dimanche',
] as const;

export type JourSemaine = (typeof JOURS_SEMAINE)[number];

export type BlocHoraire = {
    debut: number;
    fin: number;
};

/** Zone proposée dans le formulaire : affectée au technicien et active. */
export type ZoneProposee = {
    id: string;
    nomZone: string;
    couleur: CouleurZone;
};

/** Un modèle dans la liste de la page Planification. */
export type ModeleResume = {
    id: string;
    intitule: string;
    zone: ZoneProposee;
    // Faux si la zone n'est plus affectée ou est inactive : le modèle est
    // marqué invalide, on ne peut plus que le supprimer (RG11)
    valide: boolean;
};

/** Modèle complet, renvoyé après la création ou la modification. */
export type ModelePlanification = {
    id: string;
    intitule: string;
    technicienId: string;
    zoneId: string;
    jours: JourSemaine[];
    blocs: BlocHoraire[];
};

export type CreateModelePayload = {
    intitule: string;
    zoneId: string;
    jours: JourSemaine[];
    blocs: BlocHoraire[];
};

/** Modèle ouvert pour être modifié : ses valeurs, et s'il est encore valide. */
export type ModeleDetail = ModelePlanification & { valide: boolean };

// La modification remplace tout le modèle : même saisie qu'à la création
export type UpdateModelePayload = CreateModelePayload;

// Couverture des zones (« Visualiser la couverture des zones 2.0 »).
// Les jours sont ceux de Paris, au format 'AAAA-MM-JJ'.

/** Une zone couverte un jour donné : de quoi afficher son tag. */
export type ZoneCouverte = {
    id: string;
    nomZone: string;
    couleur: CouleurZone;
    isActive: boolean; // inactive : tag en gris clair (couleurAffichee)
};

/** Un jour couvert du mois et ses zones. Un jour absent n'a aucun tag. */
export type JourCouvert = {
    jour: string;
    zones: ZoneCouverte[];
};

/** Calendrier de couverture d'un mois ('AAAA-MM'). */
export type CouvertureMois = {
    mois: string;
    aujourdHui: string; // date pivot par défaut, calculée par l'API (fuseau)
    jours: JourCouvert[];
};
