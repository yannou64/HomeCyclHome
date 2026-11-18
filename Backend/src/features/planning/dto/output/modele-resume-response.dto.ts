import { ApiProperty } from '@nestjs/swagger';
import { ZoneProposeeResponseDto } from './zone-proposee-response.dto';

/**
 * Un modèle dans la liste de la page Planification (US-01 « Choisir le mode
 * de planification 2.0 ») : son intitulé, sa zone, et s'il est encore valide.
 */
export class ModeleResumeResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    intitule!: string;

    @ApiProperty({ type: () => ZoneProposeeResponseDto })
    zone!: ZoneProposeeResponseDto;

    // RG15 : faux si la zone n'est plus affectée au technicien ou est inactive.
    // L'interface marque alors le modèle en rouge, et seule la suppression
    // reste possible.
    @ApiProperty()
    valide!: boolean;
}
