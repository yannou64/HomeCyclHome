import { ApiProperty } from '@nestjs/swagger';
import { JOURS_SEMAINE, type JourSemaine } from '../jours-semaine';
import { BlocHoraireResponseDto } from './modele-planification-response.dto';
import { ZoneProposeeResponseDto } from './zone-proposee-response.dto';

/**
 * Un modèle dans la liste de la page Planification (US-01 « Choisir le mode
 * de planification 2.0 ») : son intitulé, sa zone, s'il est encore valide, et
 * ses jours et blocs, pour le situer sans l'ouvrir.
 */
export class ModeleResumeResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    intitule!: string;

    @ApiProperty({ enum: JOURS_SEMAINE, isArray: true })
    jours!: JourSemaine[];

    // Minutes depuis minuit, triés par début
    @ApiProperty({ type: () => [BlocHoraireResponseDto] })
    blocs!: BlocHoraireResponseDto[];

    @ApiProperty({ type: () => ZoneProposeeResponseDto })
    zone!: ZoneProposeeResponseDto;

    // RG15 : faux si la zone n'est plus affectée au technicien ou est inactive.
    // L'interface marque alors le modèle en rouge, et seule la suppression
    // reste possible.
    @ApiProperty()
    valide!: boolean;
}
