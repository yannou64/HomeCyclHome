import { ApiProperty } from '@nestjs/swagger';

export class TypeCycleDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    libelle: string;
}
