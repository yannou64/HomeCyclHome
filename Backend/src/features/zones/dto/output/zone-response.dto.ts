import { ApiProperty } from '@nestjs/swagger';

export class ZonePointResponseDto {
    @ApiProperty()
    latitude!: number;

    @ApiProperty()
    longitude!: number;

    @ApiProperty()
    ordre!: number;
}

export class ZoneResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    nomZone!: string;

    @ApiProperty()
    isActive!: boolean;

    @ApiProperty()
    dateCreation!: Date;

    @ApiProperty({ type: () => [ZonePointResponseDto] })
    points!: ZonePointResponseDto[];
}
