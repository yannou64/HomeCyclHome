import { ApiProperty } from '@nestjs/swagger';

export class TypeCycleResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    libelle!: string;
}
