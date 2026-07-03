import type { PaginationMeta } from '../../../shared/types/pagination.types';

export type AdminInterventionStatut = 'Planifiee' | 'Terminee' | 'Annulee';

export type AdminInterventionListItem = {
    id: string;
    statut: AdminInterventionStatut;
    enRetard: boolean;
    dateDebut: string;
    forfaitNom: string;
    zone: { id: string; nom: string };
    technicien: { id: string; prenom: string; nom: string } | null;
};

export type AdminInterventionDetail = AdminInterventionListItem & {
    dateCreation: string;
    dateFin: string | null;
    dureeMinutesSnapshot: number;
    commentaire: string | null;
    client: {
        id: string;
        prenom: string;
        nom: string;
        email: string;
        telephone: string;
    };
    adresse: {
        numero: string | null;
        rue: string;
        codePostal: string;
        ville: string;
    };
    cycle: {
        libelle: string;
        marque: string;
        type: string;
    };
    photosClient: { id: string; urlS3: string }[];
    photosTechnicien: { id: string; urlS3: string }[];
};

export type GetAdminInterventionsParams = {
    statut?: 'Planifiee' | 'enRetard' | 'archivees';
    zoneId?: string;
    technicienId?: string;
    page?: number;
    limit?: number;
};

export type PaginatedAdminInterventions = {
    data: AdminInterventionListItem[];
    meta: PaginationMeta;
};

export type ActiveInterventionTab = 'planifiees' | 'enRetard' | 'archivees';