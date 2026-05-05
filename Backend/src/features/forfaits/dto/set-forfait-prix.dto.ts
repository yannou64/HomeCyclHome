import { IsDateString, IsNumber, Min } from 'class-validator';

export class SetForfaitPrixDto {
  @IsNumber()
  @Min(0)
  montant: number;

  @IsDateString()
  date_debut: string;
}