import { ApiProperty } from '@nestjs/swagger';

/**
 * Zone proposée dans le formulaire d'un modèle : affectée au technicien et
 * active (RG5). La couleur est le nom de la palette ; l'interface la convertit.
 */
export class ZoneProposeeResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    nomZone!: string;

    @ApiProperty()
    couleur!: string;
}
