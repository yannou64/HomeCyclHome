import { ApiProperty } from '@nestjs/swagger';

export class PauseRecurrenteResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    technicienId!: string;

    @ApiProperty({
        nullable: true,
        type: Number,
        description: 'null = tous les jours, 0=lundi … 6=dimanche',
    })
    jourSemaine!: number | null;

    @ApiProperty()
    heureDebut!: number;

    @ApiProperty()
    heureFin!: number;

    @ApiProperty({ nullable: true, type: String })
    description!: string | null;
}
