import { IsNotEmpty, IsNumber } from 'class-validator';

export class CheckZoneDto {
    @IsNumber()
    @IsNotEmpty()
    latitude: number;

    @IsNumber()
    @IsNotEmpty()
    longitude: number;
}

export type CheckZoneResultDto = {
    zoneId: string;
    nomZone: string;
};
