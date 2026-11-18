import { Transform, Type } from 'class-transformer';
import {
    ArrayMinSize,
    ArrayUnique,
    IsArray,
    IsDivisibleBy,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsString,
    IsUUID,
    Max,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import { JOURS_SEMAINE, type JourSemaine } from '../jours-semaine';

// Bornes d'un bloc (RG4), en minutes depuis minuit
const DEBUT_JOURNEE = 7 * 60; // 7h00 = 420
const FIN_JOURNEE = 20 * 60; // 20h00 = 1200
const PAS_MINUTES = 30;

/**
 * Un bloc horaire, contrôlé seul : dans la journée de travail et sur le pas de
 * 30 minutes. Ce qui dépend de plusieurs valeurs (fin après début, blocs qui
 * se chevauchent) est contrôlé par le use case.
 */
export class BlocHoraireInputDto {
    @IsInt({ message: 'Le début d’un bloc est un nombre entier de minutes.' })
    @Min(DEBUT_JOURNEE, { message: 'Un bloc ne commence pas avant 7h00.' })
    @IsDivisibleBy(PAS_MINUTES, {
        message: 'Le début d’un bloc suit le pas de 30 minutes.',
    })
    debut!: number;

    @IsInt({ message: 'La fin d’un bloc est un nombre entier de minutes.' })
    @Max(FIN_JOURNEE, { message: 'Un bloc ne finit pas après 20h00.' })
    @IsDivisibleBy(PAS_MINUTES, {
        message: 'La fin d’un bloc suit le pas de 30 minutes.',
    })
    fin!: number;
}

export class CreateModelePlanificationDto {
    // Espaces autour retirés AVANT la validation : « ␣␣␣ » devient vide et
    // est refusé, « ␣Matin␣ » est enregistré « Matin » (et comparé comme tel)
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString({ message: 'L’intitulé est obligatoire.' })
    @IsNotEmpty({ message: 'L’intitulé est obligatoire.' })
    @MaxLength(100, {
        message: 'L’intitulé ne dépasse pas 100 caractères.',
    })
    intitule!: string;

    @IsUUID('all', { message: 'La zone est obligatoire.' })
    zoneId!: string;

    @IsArray()
    @ArrayMinSize(1, { message: 'Choisissez au moins un jour de la semaine.' })
    @ArrayUnique({ message: 'Un jour n’est choisi qu’une fois.' })
    @IsIn(JOURS_SEMAINE, {
        each: true,
        message: `Les jours possibles sont : ${JOURS_SEMAINE.join(', ')}.`,
    })
    jours!: JourSemaine[];

    @IsArray()
    @ArrayMinSize(1, { message: 'Ajoutez au moins un bloc horaire.' })
    @ValidateNested({ each: true })
    @Type(() => BlocHoraireInputDto)
    blocs!: BlocHoraireInputDto[];
}
