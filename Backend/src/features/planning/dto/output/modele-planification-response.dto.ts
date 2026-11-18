import { ApiProperty } from '@nestjs/swagger';
import { JOURS_SEMAINE, type JourSemaine } from '../jours-semaine';

export class BlocHoraireResponseDto {
    @ApiProperty({ description: 'Minutes depuis minuit (480 = 8h00)' })
    debut!: number;

    @ApiProperty({ description: 'Minutes depuis minuit (720 = 12h00)' })
    fin!: number;
}

export class ModelePlanificationResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    intitule!: string;

    @ApiProperty()
    technicienId!: string;

    @ApiProperty()
    zoneId!: string;

    @ApiProperty({ enum: JOURS_SEMAINE, isArray: true })
    jours!: JourSemaine[];

    // Triés par heure de début
    @ApiProperty({ type: () => [BlocHoraireResponseDto] })
    blocs!: BlocHoraireResponseDto[];
}
