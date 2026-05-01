import { IsString, MinLength } from 'class-validator';

export class CreateMarqueDto {
    @IsString()
    @MinLength(2, { message: 'Le libellé doit faire au moins 2 caractères' })
    libelle: string;
}
