import { ApiProperty } from '@nestjs/swagger';

export class MarqueDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    libelle: string;
}
