import { ApiProperty } from '@nestjs/swagger';

export class IndisponibiliteResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    technicienId!: string;

    @ApiProperty({ description: 'ISO 8601' })
    dateDebut!: string;

    @ApiProperty({ description: 'ISO 8601' })
    dateFin!: string;

    @ApiProperty({ nullable: true, type: String })
    motif!: string | null;
}
