import type { JourSemaine } from '../dto/jours-semaine';
import type { ModelePlanificationResponseDto } from '../dto/output/modele-planification-response.dto';
import type { ZoneProposeeResponseDto } from '../dto/output/zone-proposee-response.dto';

// Jeton d'injection : l'interface disparaît à la compilation, Nest retrouve
// l'implémentation par ce nom (voir le module).
export const PLANNING_REPO = 'PLANNING_REPO';

/** Ce que le repository enregistre pour un nouveau modèle, déjà contrôlé. */
export type CreateModeleData = {
    technicienId: string;
    zoneId: string;
    intitule: string; // déjà sans espaces autour
    jours: JourSemaine[];
    blocs: { debut: number; fin: number }[]; // minutes depuis minuit
};

/**
 * Un modèle tel que lu en base pour la liste : les faits seulement (zone
 * active ? encore affectée ?). Le use case en déduit s'il est valide (RG15).
 */
export type ModeleAvecZone = {
    id: string;
    intitule: string;
    zone: { id: string; nomZone: string; couleur: string; isActive: boolean };
    zoneAffectee: boolean;
};

/** Ce que le repository remplace dans un modèle existant, déjà contrôlé. */
export type ModifierModeleData = Omit<CreateModeleData, 'technicienId'>;

/**
 * Un modèle complet tel que lu en base, avec les faits sur sa zone : le use
 * case en déduit s'il est valide (RG11) et donc modifiable.
 */
export type ModeleDetail = ModelePlanificationResponseDto & {
    zoneActive: boolean;
    zoneAffectee: boolean;
};

/**
 * Un créneau lu pour la couverture : son instant de début (UTC), son statut,
 * son technicien et les faits sur sa zone. Le regroupement par jour de Paris
 * se fait dans le use case.
 */
export type CreneauAvecZone = {
    dateDebut: Date;
    statut: 'Libre' | 'InterventionReservee' | 'Deplacement';
    technicienId: string;
    zone: { id: string; nomZone: string; couleur: string; isActive: boolean };
};

/** Un technicien, pour les cartes de la journée. */
export type TechnicienResume = {
    id: string;
    prenom: string;
    nom: string;
    isActif: boolean;
};

/** Une zone, pour les cartes de la journée. */
export type ZoneResume = {
    id: string;
    nomZone: string;
    couleur: string;
    isActive: boolean;
};

/** Début du dernier créneau de chaque technicien et de chaque zone (UTC). */
export type DerniersCreneaux = {
    parTechnicien: Map<string, Date>;
    parZone: Map<string, Date>;
};

/** Ce qu'une planification ferait disparaître sur sa période (RG10). */
export type ComptagePeriode = {
    creneaux: number; // tous statuts confondus
    interventions: number; // distinctes, tous statuts (écart du 23/11/2026)
};

/**
 * Remplacement des créneaux d'un technicien sur une période (« Planifier un
 * technicien 2.0 », RG9) : déjà contrôlé, les instants déjà calculés à Paris.
 */
export type RemplacementCreneaux = {
    technicienId: string;
    zoneId: string;
    debut: Date; // minuit (Paris) du premier jour, inclus
    fin: Date; // minuit (Paris) du lendemain du dernier jour, exclu
    nouveaux: Date[]; // début de chaque créneau Libre à créer
    entreeConflit: string; // entrée du commentaire partagé, déjà formatée (RG16)
};

/** Ce que le remplacement a fait. */
export type ResultatRemplacement = {
    creneauxSupprimes: number;
    interventionsEnConflit: number;
};

// Le contrat : les use cases dépendent de cette interface, jamais de Prisma
export interface IPlanningRepository {
    /** Vrai si l'id désigne un utilisateur de rôle technicien. */
    technicienExiste(technicienId: string): Promise<boolean>;

    /** Zones affectées au technicien et actives (RG5), triées par nom. */
    trouverZonesProposees(
        technicienId: string,
    ): Promise<ZoneProposeeResponseDto[]>;

    /** Vrai si la zone est affectée au technicien et active (RG5). */
    zoneAffecteeEtActive(
        technicienId: string,
        zoneId: string,
    ): Promise<boolean>;

    /**
     * Vrai si le technicien a déjà un modèle de cet intitulé, sans tenir
     * compte de la casse (RG3). `saufModeleId` : le modèle en cours de
     * modification ne compte pas comme doublon de lui-même.
     */
    intituleExiste(
        technicienId: string,
        intitule: string,
        saufModeleId?: string,
    ): Promise<boolean>;

    /** Modèles du technicien, triés par intitulé, avec les faits sur leur zone. */
    trouverModeles(technicienId: string): Promise<ModeleAvecZone[]>;

    /**
     * Le modèle `modeleId` s'il appartient au technicien, sinon null : un
     * modèle d'un autre technicien est « introuvable » (RG10).
     */
    trouverModele(
        technicienId: string,
        modeleId: string,
    ): Promise<ModeleDetail | null>;

    /** Écrit le modèle et ses blocs en une seule transaction (tout ou rien). */
    creerModele(
        data: CreateModeleData,
    ): Promise<ModelePlanificationResponseDto>;

    /**
     * Remplace l'intitulé, la zone, les jours et tous les blocs du modèle, en
     * une seule transaction (tout ou rien). Renvoie null si le modèle n'existe
     * plus pour ce technicien (supprimé entre-temps).
     */
    modifierModele(
        technicienId: string,
        modeleId: string,
        data: ModifierModeleData,
    ): Promise<ModelePlanificationResponseDto | null>;

    /**
     * Supprime le modèle et ses blocs en une seule transaction (tout ou
     * rien). Renvoie false si le modèle n'existe pas pour ce technicien
     * (inexistant, d'un autre technicien, ou déjà supprimé).
     */
    supprimerModele(technicienId: string, modeleId: string): Promise<boolean>;

    /**
     * Créneaux dont le début est dans [debut, fin[, avec leur zone. Avec
     * `technicienId` : ceux de ce technicien seulement.
     */
    trouverCreneauxEntre(
        debut: Date,
        fin: Date,
        technicienId?: string,
    ): Promise<CreneauAvecZone[]>;

    /** Le technicien `technicienId`, ou null si l'id n'en désigne pas un. */
    trouverTechnicien(technicienId: string): Promise<TechnicienResume | null>;

    /** Tous les utilisateurs de rôle technicien, actifs ou non. */
    trouverTechniciens(): Promise<TechnicienResume[]>;

    /** Toutes les zones, actives ou non. */
    trouverZones(): Promise<ZoneResume[]>;

    /** Le dernier créneau de chaque technicien et de chaque zone. */
    derniersCreneaux(): Promise<DerniersCreneaux>;

    /** Créneaux du technicien dans [debut, fin[ et interventions liées. */
    compterPeriode(
        technicienId: string,
        debut: Date,
        fin: Date,
    ): Promise<ComptagePeriode>;

    /**
     * Une seule transaction (tout ou rien, séquence de l'US-03 étapes 10 à
     * 15) : passe en conflit les interventions Planifiées qui ont un créneau
     * dans la période, écrit l'origine dans leur commentaire partagé,
     * supprime tous les créneaux du technicien de la période, crée les
     * nouveaux créneaux Libres. Renvoie null si la transaction a été annulée
     * parce que le planning a changé entre-temps (statut d'une intervention,
     * créneau créé au même horaire par une autre génération).
     */
    remplacerCreneaux(
        data: RemplacementCreneaux,
    ): Promise<ResultatRemplacement | null>;
}
