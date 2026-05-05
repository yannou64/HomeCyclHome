import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateForfaitDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  duree_minutes?: number;

  @IsOptional()
  @IsBoolean()
  is_actif?: boolean;
}
