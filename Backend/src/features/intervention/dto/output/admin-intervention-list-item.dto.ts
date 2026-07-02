import { ApiProperty } from '@nestjs/swagger';

class ZoneSnapshotDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    nom: string;
}

class TechnicienSnapshotDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    prenom: string;

    @ApiProperty()
    nom: string;
}

export class AdminInterventionListItemDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: ['Planifiee', 'Terminee', 'Annulee'] })
    statut: 'Planifiee' | 'Terminee' | 'Annulee';

    @ApiProperty({
        description:
            "Vrai si l'intervention est Planifiee et que sa date de début est passée (calculé côté serveur)",
    })
    enRetard: boolean;

    @ApiProperty()
    dateDebut: string;

    @ApiProperty()
    forfaitNom: string;

    @ApiProperty({ type: () => ZoneSnapshotDto })
    zone: ZoneSnapshotDto;

    @ApiProperty({ nullable: true, type: () => TechnicienSnapshotDto })
    technicien: TechnicienSnapshotDto | null;
}
