import { ApiProperty } from '@nestjs/swagger';

export class InterventionCreatedResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({ enum: ['Planifiee', 'Terminee', 'Annulee'] })
    statut!: 'Planifiee' | 'Terminee' | 'Annulee';

    @ApiProperty({ description: 'ISO 8601' })
    dateCreation!: string;
}
