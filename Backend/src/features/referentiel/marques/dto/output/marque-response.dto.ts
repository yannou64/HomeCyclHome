import { ApiProperty } from '@nestjs/swagger';

export class MarqueResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    libelle!: string;
}
