import { ApiProperty } from '@nestjs/swagger';

class AdresseSnapshotDto {
    @ApiProperty({ nullable: true, type: String })
    numero: string | null;

    @ApiProperty()
    rue: string;

    @ApiProperty()
    codePostal: string;

    @ApiProperty()
    ville: string;
}

class CycleSnapshotDto {
    @ApiProperty()
    libelle: string;

    @ApiProperty()
    marque: string;

    @ApiProperty()
    type: string;
}

export class InterventionListItemDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: ['Planifiee', 'Terminee', 'Annulee'] })
    statut: 'Planifiee' | 'Terminee' | 'Annulee';

    @ApiProperty()
    dateCreation: string;

    @ApiProperty()
    dateDebut: string;

    @ApiProperty({ nullable: true, type: String })
    dateFin: string | null;

    @ApiProperty()
    forfaitNom: string;

    @ApiProperty()
    dureeMinutesSnapshot: number;

    @ApiProperty({ type: () => AdresseSnapshotDto })
    adresse: AdresseSnapshotDto;

    @ApiProperty({ type: () => CycleSnapshotDto })
    cycle: CycleSnapshotDto;

    @ApiProperty({ nullable: true, type: String })
    commentaire: string | null;
}
