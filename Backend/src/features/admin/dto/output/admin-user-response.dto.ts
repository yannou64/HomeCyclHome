import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../users/dto/output/user-profile-response.dto';

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
