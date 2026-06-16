export type InterventionListItemDto = {
    id: string;
    statut: 'Planifiee' | 'Terminee' | 'Annulee';
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
