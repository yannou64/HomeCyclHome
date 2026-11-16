import { ApiProperty } from '@nestjs/swagger';

class ZoneSnapshotDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    nom!: string;
}

class TechnicienSnapshotDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    prenom!: string;

    @ApiProperty()
    nom!: string;
}

export class AdminInterventionListItemResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({ enum: ['Planifiee', 'Realisee', 'Annulee', 'EnConflit'] })
    statut!: 'Planifiee' | 'Realisee' | 'Annulee' | 'EnConflit';

    @ApiProperty({
        description:
            "Vrai si l'intervention est Planifiee et que sa date de début est passée (calculé côté serveur)",
    })
    enRetard!: boolean;

    @ApiProperty()
    dateDebut!: string;

    @ApiProperty()
    forfaitNom!: string;

    // Lue sur les créneaux de l'intervention : null si ses créneaux ont été
    // supprimés (intervention en conflit).
    @ApiProperty({ nullable: true, type: () => ZoneSnapshotDto })
    zone!: ZoneSnapshotDto | null;

    @ApiProperty({ nullable: true, type: () => TechnicienSnapshotDto })
    technicien!: TechnicienSnapshotDto | null;
}
