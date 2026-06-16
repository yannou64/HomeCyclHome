export type AdminInterventionStatut = 'Planifiee' | 'Terminee' | 'Annulee';

export type AdminInterventionListItem = {
    id: string;
    statut: AdminInterventionStatut;
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
};

export type GetAdminInterventionsParams = {
    statut?: 'Planifiee' | 'archivees';
    zoneId?: string;
    technicienId?: string;
};

export type ActiveInterventionTab = 'planifiees' | 'archivees';
