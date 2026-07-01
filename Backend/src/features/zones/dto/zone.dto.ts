import { ApiProperty } from '@nestjs/swagger';

export class ZonePointDto {
    @ApiProperty()
    latitude: number;

    @ApiProperty()
    longitude: number;

    @ApiProperty()
    ordre: number;
}

export class ZoneDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    nomZone: string;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    dateCreation: Date;

    @ApiProperty({ type: () => [ZonePointDto] })
    points: ZonePointDto[];
}
