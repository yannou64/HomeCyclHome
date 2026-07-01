import { ApiProperty } from '@nestjs/swagger';

export class ForfaitDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    nom: string;

    @ApiProperty({ nullable: true, type: String })
    description: string | null;

    @ApiProperty()
    dureeMinutes: number;

    @ApiProperty()
    isActif: boolean;

    @ApiProperty({ nullable: true, type: Number })
    prixActif: number | null;
}
