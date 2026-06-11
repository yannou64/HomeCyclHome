import type { InterventionCreatedDto } from '../dto/output/intervention-created.dto';

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
}
