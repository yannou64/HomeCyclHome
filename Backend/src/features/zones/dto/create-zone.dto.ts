import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';

export class ZonePointInputDto {
    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;

    @IsInt()
    @Min(0)
    ordre: number;
}

export class CreateZoneDto {
    @IsString()
    @IsNotEmpty()
    nomZone: string;

    @IsArray()
    @ArrayMinSize(3)
    @ValidateNested({ each: true })
    @Type(() => ZonePointInputDto)
    points: ZonePointInputDto[];
}
