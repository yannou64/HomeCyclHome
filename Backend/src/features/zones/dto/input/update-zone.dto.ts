import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsIn,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { ZonePointInputDto } from './create-zone.dto';
import {
    COULEURS_ZONE,
    MESSAGE_COULEUR_INVALIDE,
    type CouleurZone,
} from '../couleur-zone';

export class UpdateZoneDto {
    @IsOptional()
    @IsString()
    nomZone?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    // Facultative en modification ; si elle est fournie, même contrôle qu'à la
    // création. Le ValidationPipe refuse la requête avant le use case : ni la
    // couleur ni les points envoyés avec elle ne sont écrits.
    @IsOptional()
    @IsIn(COULEURS_ZONE, { message: MESSAGE_COULEUR_INVALIDE })
    couleur?: CouleurZone;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(3)
    @ValidateNested({ each: true })
    @Type(() => ZonePointInputDto)
    points?: ZonePointInputDto[];
}
