import { ApiProperty } from '@nestjs/swagger';

export class CreneauResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({ description: 'ISO 8601' })
    dateDebut!: string;

    @ApiProperty({
        nullable: true,
        type: String,
        description: 'null à la génération, rempli à la réservation',
    })
    dateFin!: string | null;

    @ApiProperty()
    isDisponible!: boolean;

    @ApiProperty()
    zoneId!: string;

    @ApiProperty({ nullable: true, type: String })
    modelePlanificationId!: string | null;
}

// Étend CreneauResponseDto avec le technicien résolu depuis la relation modele_planification.
// intervalleMinutes vaut Infinity pour un créneau manuel (sans modèle).
export type CreneauAvecTechnicien = CreneauResponseDto & {
    technicienId: string | null;
    technicienPrenom: string | null;
    intervalleMinutes: number;
};
