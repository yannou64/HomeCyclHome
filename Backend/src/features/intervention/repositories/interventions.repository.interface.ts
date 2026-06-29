import type { InterventionCreatedDto } from '../dto/output/intervention-created.dto';
import type { InterventionListItemDto } from '../dto/output/intervention-list-item.dto';
import type { AdminInterventionListItemDto } from '../dto/output/admin-intervention-list-item.dto';
import type { AdminInterventionDetailDto } from '../dto/output/admin-intervention-detail.dto';

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
    statut?: 'Planifiee' | 'archivees';
    zoneId?: string;
    technicienId?: string;
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
    getForfaitDuree(forfaitId: string): Promise<number>;
    createInterventionTransaction(
        data: CreateInterventionData,
    ): Promise<InterventionCreatedDto>;
    findClientById(clientId: string): Promise<ClientInfo | null>;
    getInterventionsByClientId(
        clientId: string,
    ): Promise<InterventionListItemDto[]>;
    findInterventionForCancel(
        id: string,
    ): Promise<InterventionForCancel | null>;
    cancelInterventionTransaction(
        interventionId: string,
        creneauId: string,
    ): Promise<void>;
    findAllInterventions(
        params: GetAdminInterventionsParams,
    ): Promise<AdminInterventionListItemDto[]>;
    findInterventionDetailById(
        id: string,
    ): Promise<AdminInterventionDetailDto | null>;
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
