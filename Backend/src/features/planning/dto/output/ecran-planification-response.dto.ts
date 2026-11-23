import { ApiProperty } from '@nestjs/swagger';
import { ZoneProposeeResponseDto } from './zone-proposee-response.dto';

/**
 * Ouverture de l'écran de planification d'un technicien (séquence de l'US-02,
 * étapes 2 à 5).
 */
export class EcranPlanificationResponseDto {
    // Calculé par l'API dans le fuseau d'exploitation : la page préremplit la
    // date de début avec (écart du 23/11/2026)
    @ApiProperty({ example: '2026-11-24', description: 'Demain, à Paris' })
    demain!: string;

    // Affectées au technicien et actives (RG4, RG5)
    @ApiProperty({ type: [ZoneProposeeResponseDto] })
    zones!: ZoneProposeeResponseDto[];
}
