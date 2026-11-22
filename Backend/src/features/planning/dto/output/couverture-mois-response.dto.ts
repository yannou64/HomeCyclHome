import { ApiProperty } from '@nestjs/swagger';

/** Une zone couverte un jour donné : de quoi afficher son tag. */
export class ZoneCouverteResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    nomZone!: string;

    // Nom de la palette ; l'interface la convertit (gris si inactive, RG10)
    @ApiProperty()
    couleur!: string;

    // RG11 : une zone inactive qui a encore des créneaux reste visible
    @ApiProperty()
    isActive!: boolean;
}

/** Un jour couvert du mois et ses zones, triées par nom. */
export class JourCouvertResponseDto {
    @ApiProperty({ example: '2026-11-23', description: 'Jour de Paris' })
    jour!: string;

    @ApiProperty({ type: () => [ZoneCouverteResponseDto] })
    zones!: ZoneCouverteResponseDto[];
}

/**
 * Calendrier de couverture d'un mois (US-01). Seuls les jours couverts sont
 * listés : un jour absent n'a aucun créneau, donc aucun tag (RG2).
 */
export class CouvertureMoisResponseDto {
    @ApiProperty({ example: '2026-11' })
    mois!: string;

    // Date pivot par défaut, calculée dans le fuseau d'exploitation (RG4,
    // écart du 22/11/2026 : la page ne la calcule pas elle-même)
    @ApiProperty({ example: '2026-11-22' })
    aujourdHui!: string;

    @ApiProperty({ type: () => [JourCouvertResponseDto] })
    jours!: JourCouvertResponseDto[];
}
