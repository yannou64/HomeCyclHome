import { ApiProperty } from '@nestjs/swagger';

export type UserRole = 'client' | 'technicien' | 'admin';

export class UserProfileResponseDto {
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
}
