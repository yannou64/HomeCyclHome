export type InterventionStatut = 'Planifiee' | 'Terminee' | 'Annulee';

export type InterventionClientDto = {
    id: string;
    statut: InterventionStatut;
    dateCreation: string;
    dateDebut: string;
    dateFin: string | null;
    forfaitNom: string;
    dureeMinutesSnapshot: number;
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
    commentaire: string | null;
};
