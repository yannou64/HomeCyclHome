import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../../shared/types/user-role';

export class AdminUserResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    nom!: string;

    @ApiProperty()
    prenom!: string;

    @ApiProperty()
    email!: string;

    @ApiProperty()
    telephone!: string;

    @ApiProperty({ enum: ['client', 'technicien', 'admin'] })
    role!: UserRole;

    @ApiProperty()
    isActif!: boolean;

    @ApiProperty()
    dateCreation!: Date;
}
