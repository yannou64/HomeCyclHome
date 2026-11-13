import type { CreneauAvecTechnicien } from '../../planning/dto/output/creneau-response.dto';
import type { InterventionCreatedResponseDto } from '../dto/output/intervention-created-response.dto';
import type { InterventionListItemResponseDto } from '../dto/output/intervention-list-item-response.dto';
import type { AdminInterventionListItemResponseDto } from '../dto/output/admin-intervention-list-item-response.dto';
import type { AdminInterventionDetailResponseDto } from '../dto/output/admin-intervention-detail-response.dto';

export type InterventionForCancel = {
    clientId: string;
    statut: string;
    creneauId: string;
};

export type UpsertAdresseInput = {
    rue: string;
    codePostal: string;
    ville: string;
    latitude: number;
    longitude: number;
    googlePlaceId: string;
    numero?: string;
    pays?: string;
};

export type CreateCycleInput = {
    typeCycleId: string;
    marqueId: string;
};

export type PrixForfait = {
    id: string;
    montant: number;
};

export type ClientInfo = {
    email: string;
    prenom: string;
};

export type GetAdminInterventionsParams = {
    statut?: 'Planifiee' | 'enRetard' | 'archivees';
    zoneId?: string;
    technicienId?: string;
    page: number;
    limit: number;
};

export type CreateInterventionData = {
    clientId: string;
    cycleId: string;
    forfaitId: string;
    creneauId: string;
    adresseId: string;
    historiquePrixForfaitId: string;
    dureeMinutesSnapshot: number;
    technicienId: string | null;
    commentaire?: string;
};

export interface IInterventionsRepository {
    isCreneauDisponible(creneauId: string): Promise<boolean>;
    createCycle(utilisateurId: string, data: CreateCycleInput): Promise<string>;
    upsertAdresse(data: UpsertAdresseInput): Promise<string>;
    getPrixActuelForfait(forfaitId: string): Promise<PrixForfait | null>;
    getTechnicienFromCreneau(creneauId: string): Promise<string | null>;
    // Tous les slots du même technicien sur la même journée que le créneau donné,
    // triés par dateDebut. Nécessaire pour rejouer la règle de réservabilité à
    // l'écriture : elle raisonne sur le voisinage immédiat du créneau.
    findCreneauxDuJour(creneauId: string): Promise<CreneauAvecTechnicien[]>;
    getForfaitDuree(forfaitId: string): Promise<number>;
    createInterventionTransaction(
        data: CreateInterventionData,
    ): Promise<InterventionCreatedResponseDto>;
    findClientById(clientId: string): Promise<ClientInfo | null>;
    getInterventionsByClientId(
        clientId: string,
    ): Promise<InterventionListItemResponseDto[]>;
    findInterventionForCancel(
        id: string,
    ): Promise<InterventionForCancel | null>;
    cancelInterventionTransaction(
        interventionId: string,
        creneauId: string,
    ): Promise<void>;
    findAllInterventions(params: GetAdminInterventionsParams): Promise<{
        interventions: AdminInterventionListItemResponseDto[];
        total: number;
    }>;
    findInterventionDetailById(
        id: string,
    ): Promise<AdminInterventionDetailResponseDto | null>;
    // --- Photos ---
    isInterventionOwnedByClient(
        interventionId: string,
        clientId: string,
    ): Promise<boolean>;
    getPhotosCount(interventionId: string): Promise<number>;
    createPhotos(
        interventionId: string,
        photos: { urlS3: string; cleS3: string }[],
        contexte: 'client' | 'technicien',
    ): Promise<void>;
}
