import { ApiProperty } from '@nestjs/swagger';

/**
 * Ce que la planification remplacerait (RG10) : de quoi rédiger
 * l'avertissement. Zéro créneau : pas d'avertissement (CA03 de l'US-03).
 */
export class ApercuPlanificationResponseDto {
    // Tous les créneaux du technicien sur la période, tous statuts
    @ApiProperty()
    creneauxSupprimes!: number;

    // Interventions distinctes qui y ont un créneau, tous statuts
    // (écart du 23/11/2026)
    @ApiProperty()
    interventionsTouchees!: number;
}
