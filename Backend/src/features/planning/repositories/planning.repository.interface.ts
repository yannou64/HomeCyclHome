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
}
