import { ApiProperty } from '@nestjs/swagger';

export class ModelePlanificationResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    technicienId!: string;

    @ApiProperty()
    zoneId!: string;

    @ApiProperty({
        description:
            '0=lundi, 1=mardi, 2=mercredi, 3=jeudi, 4=vendredi, 5=samedi, 6=dimanche',
    })
    jourSemaine!: number;

    @ApiProperty({
        description: 'Minutes depuis minuit : 510 = 8h30, 1020 = 17h00',
    })
    heureDebut!: number;

    @ApiProperty()
    heureFin!: number;

    @ApiProperty()
    intervalleMinutes!: number;

    @ApiProperty()
    isActif!: boolean;

    @ApiProperty({ description: 'ISO 8601' })
    dateDebutValidite!: string;

    @ApiProperty({ nullable: true, type: String, description: 'ISO 8601' })
    dateFinValidite!: string | null;
}
