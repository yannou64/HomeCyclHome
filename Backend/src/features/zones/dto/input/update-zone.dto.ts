import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { ZonePointInputDto } from './create-zone.dto';

export class UpdateZoneDto {
    @IsOptional()
    @IsString()
    nomZone?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(3)
    @ValidateNested({ each: true })
    @Type(() => ZonePointInputDto)
    points?: ZonePointInputDto[];
}
