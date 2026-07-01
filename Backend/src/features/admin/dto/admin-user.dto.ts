import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/dto/user-profile.dto';

export class AdminUserDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    nom: string;

    @ApiProperty()
    prenom: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    telephone: string;

    @ApiProperty({ enum: ['client', 'technicien', 'admin'] })
    role: UserRole;

    @ApiProperty()
    isActif: boolean;

    @ApiProperty()
    dateCreation: Date;
}

class PaginationMetaDto {
    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    totalPages: number;
}

export class PaginatedUsersDto {
    @ApiProperty({ type: () => [AdminUserDto] })
    data: AdminUserDto[];

    @ApiProperty({ type: () => PaginationMetaDto })
    meta: PaginationMetaDto;
}
