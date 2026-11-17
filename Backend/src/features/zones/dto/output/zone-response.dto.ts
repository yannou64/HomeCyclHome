import { ApiProperty } from '@nestjs/swagger';
import { COULEURS_ZONE, type CouleurZone } from '../couleur-zone';

export class ZonePointResponseDto {
    @ApiProperty()
    latitude!: number;

    @ApiProperty()
    longitude!: number;

    @ApiProperty()
    ordre!: number;
}

export class ZoneResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    nomZone!: string;

    @ApiProperty()
    isActive!: boolean;

    // Le nom de la couleur (« Bleu »), jamais son code hexadécimal : l'interface
    // fait la correspondance, et affiche le gris si la zone est inactive
    @ApiProperty({ enum: COULEURS_ZONE })
    couleur!: CouleurZone;

    @ApiProperty()
    dateCreation!: Date;

    @ApiProperty({ type: () => [ZonePointResponseDto] })
    points!: ZonePointResponseDto[];
}
