import { ApiProperty } from '@nestjs/swagger';

export class GenerationRapportResponseDto {
    @ApiProperty({ description: 'Créneaux nouvellement insérés' })
    created!: number;

    @ApiProperty({
        description: 'Slots sautés (pause, indisponibilité, doublon)',
    })
    skipped!: number;

    @ApiProperty({
        description:
            'Créneaux isDisponible=false dans la période (déjà réservés)',
    })
    conflicts!: number;
}
