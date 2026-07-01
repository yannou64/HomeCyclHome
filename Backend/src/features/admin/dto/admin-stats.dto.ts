import { ApiProperty } from '@nestjs/swagger';

export class AdminStatsDto {
    @ApiProperty({ description: 'Interventions avec statut Planifiée' })
    interventionsPlanifiees: number;

    @ApiProperty({ description: 'Zones géographiques actives' })
    zonesCouvertes: number;

    @ApiProperty({ description: 'Techniciens avec au moins une affectation de zone' })
    nombreTechniciens: number;
}
