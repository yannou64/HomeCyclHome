import { ApiProperty } from '@nestjs/swagger';

export class CreneauDisponibleResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({ description: 'ISO 8601' })
    dateDebut!: string;

    @ApiProperty({
        description: 'ISO 8601 — dateDebut + dureeMinutes du forfait',
    })
    dateFin!: string;

    @ApiProperty({
        nullable: true,
        type: String,
        description: 'null si créneau sans modèle de planification',
    })
    technicienId!: string | null;

    @ApiProperty({
        nullable: true,
        type: String,
        description:
            'Prénom du technicien affecté — affiché dans le calendrier',
    })
    technicienPrenom!: string | null;

    @ApiProperty({
        description:
            'Durée d’un slot de la grille, en minutes — utilisée par le calendrier client',
    })
    intervalleMinutes!: number;

    @ApiProperty()
    zoneId!: string;
}
