export class CycleDto {
    id: string;
    libelle: string;
    particularite: string | null;
    dateCreation: Date;
    utilisateurId: string;
    marque: { id: string; libelle: string };
    typeCycle: { id: string; libelle: string };
}
