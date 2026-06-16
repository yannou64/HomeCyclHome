export type AdminInterventionListItemDto = {
    id: string;
    statut: 'Planifiee' | 'Terminee' | 'Annulee';
    dateDebut: string;
    forfaitNom: string;
    zone: { id: string; nom: string };
    technicien: { id: string; prenom: string; nom: string } | null;
};
