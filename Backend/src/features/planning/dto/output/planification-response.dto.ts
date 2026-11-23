import { ApiProperty } from '@nestjs/swagger';

/** Résultat d'une génération, pour le message de confirmation. */
export class PlanificationResponseDto {
    @ApiProperty()
    creneauxCrees!: number;

    @ApiProperty()
    creneauxSupprimes!: number;

    // Interventions Planifiées passées en conflit (RG11)
    @ApiProperty()
    interventionsEnConflit!: number;
}
