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

// Planification d'un technicien (« Planifier un technicien 2.0 »).

/** Ouverture de l'écran de planification. */
export type EcranPlanification = {
    demain: string; // 'AAAA-MM-JJ', calculé par l'API à Paris (RG6)
    zones: ZoneProposee[]; // affectées au technicien et actives
};

/** Période d'une planification, bornes incluses ('AAAA-MM-JJ'). */
export type Periode = {
    dateDebut: string;
    dateFin: string; // vide tant que l'admin ne l'a pas choisie
};

/** Saisie envoyée à l'aperçu et à la génération. */
export type PlanifierPayload = Periode & {
    zoneId: string;
    jours: JourSemaine[];
    blocs: BlocHoraire[];
    confirmation?: boolean; // l'admin a confirmé l'avertissement (RG10)
};

/** Ce que la planification remplacerait : les nombres de l'avertissement. */
export type ApercuPlanification = {
    creneauxSupprimes: number;
    interventionsTouchees: number;
};

/** Résultat d'une génération. */
export type ResultatPlanification = {
    creneauxCrees: number;
    creneauxSupprimes: number;
    interventionsEnConflit: number;
};

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

export type StatutCreneau = 'Libre' | 'InterventionReservee' | 'Deplacement';

/** Un créneau de 30 min, placé en minutes après minuit (heure de Paris). */
export type CreneauJournee = { debut: number; statut: StatutCreneau };

/** Carte d'un technicien pour la date pivot. */
export type CarteTechnicien = {
    id: string;
    prenom: string;
    nom: string;
    zone: ZoneCouverte | null; // null : aucun créneau ce jour-là
    creneaux: CreneauJournee[];
    planifieJusquau: string | null; // null : « non planifié »
};

/** Carte d'une zone pour la date pivot. */
export type CarteZone = ZoneCouverte & {
    etat: 'disponible' | 'complet' | 'non couverte';
    tranchesLibres: number[]; // débuts des tranches où un technicien est libre
    derniereCouverture: string | null; // null : « aucune couverture »
};

// Page d'un technicien (« Consulter le planning d'un technicien 2.0 »).

/** Un technicien, de quoi le nommer. */
export type TechnicienNomme = { id: string; prenom: string; nom: string };

/**
 * Calendrier d'un technicien : même format que la couverture, réduit à lui
 * (un seul point par jour planifié, RG2).
 */
export type CalendrierTechnicien = CouvertureMois & {
    technicien: TechnicienNomme;
};

/** La journée pivot : une carte par technicien, une carte par zone. */
export type Journee = {
    date: string;
    techniciens: CarteTechnicien[];
    zones: CarteZone[];
};
