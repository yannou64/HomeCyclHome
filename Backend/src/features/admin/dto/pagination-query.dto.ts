import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { UserRole } from '../../users/dto/user-profile.dto';

export class PaginationQueryDto {
    // @Type(() => Number) convertit la string de l'URL en nombre avant validation
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsIn(['client', 'technicien', 'admin'])
    role?: UserRole;

    // @Transform convertit la string 'true'/'false' en booléen avant validation
    @IsOptional()
    @Transform(({ value }: { value: unknown }) => value === 'true')
    @IsBoolean()
    isActif?: boolean;
}
