import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import {
    COULEURS_ZONE,
    MESSAGE_COULEUR_INVALIDE,
    type CouleurZone,
} from '../couleur-zone';

export class ZonePointInputDto {
    @IsNumber()
    latitude!: number;

    @IsNumber()
    longitude!: number;

    @IsInt()
    @Min(0)
    ordre!: number;
}

export class CreateZoneDto {
    @IsString()
    @IsNotEmpty()
    nomZone!: string;

    // Obligatoire : absente, hors palette, hexadécimale ou grise → 400.
    // @IsIn refuse aussi une valeur absente (undefined n'est pas dans la liste).
    @IsIn(COULEURS_ZONE, { message: MESSAGE_COULEUR_INVALIDE })
    couleur!: CouleurZone;

    @IsArray()
    @ArrayMinSize(3)
    @ValidateNested({ each: true })
    @Type(() => ZonePointInputDto)
    points!: ZonePointInputDto[];
}
