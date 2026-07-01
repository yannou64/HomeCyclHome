import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckZoneDto {
    @IsNumber()
    @IsNotEmpty()
    latitude: number;

    @IsNumber()
    @IsNotEmpty()
    longitude: number;
}

export class CheckZoneResultDto {
    @ApiProperty()
    zoneId: string;

    @ApiProperty()
    nomZone: string;
}
