import type { AdminInterventionListItemDto } from './admin-intervention-list-item.dto';

export type AdminInterventionDetailDto = AdminInterventionListItemDto & {
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
    photosClient: { id: string; url_s3: string }[];
    photosTechnicien: { id: string; url_s3: string }[];
};
