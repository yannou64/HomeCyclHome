import {
    IsIn,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AdresseBookingDto {
    @IsIn(['saved', 'autocomplete'])
    source: 'saved' | 'autocomplete';

    // Champs source === 'saved'
    @IsOptional()
    @IsUUID()
    adresseId?: string;

    // Champs source === 'autocomplete'
    @IsOptional() @IsString() rue?: string;
    @IsOptional() @IsString() codePostal?: string;
    @IsOptional() @IsString() ville?: string;
    @IsOptional() @IsNumber() latitude?: number;
    @IsOptional() @IsNumber() longitude?: number;
    @IsOptional() @IsString() googlePlaceId?: string;
    @IsOptional() @IsString() numero?: string;
    @IsOptional() @IsString() pays?: string;
}

class CycleBookingDto {
    @IsIn(['existing', 'new'])
    source: 'existing' | 'new';

    @IsOptional() @IsUUID() cycleId?: string;
    @IsOptional() @IsUUID() typeCycleId?: string;
    @IsOptional() @IsUUID() marqueId?: string;
}

export class CreateInterventionDto {
    @ValidateNested()
    @Type(() => AdresseBookingDto)
    adresse: AdresseBookingDto;

    @ValidateNested()
    @Type(() => CycleBookingDto)
    cycle: CycleBookingDto;

    @IsUUID()
    forfaitId: string;

    @IsUUID()
    creneauId: string;

    @IsOptional()
    @IsString()
    commentaire?: string;
}
