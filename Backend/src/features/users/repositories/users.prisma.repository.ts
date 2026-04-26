import { Injectable } from '@nestjs/common';
import { Utilisateur } from '../../../../generated/prisma';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { UserProfileDto } from '../dto/user-profile.dto';
import {
    IUsersRepository,
    UpdateUserData,
} from './users.repository.interface';

@Injectable()
export class UsersPrismaRepository implements IUsersRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string): Promise<UserProfileDto | null> {
        const user = await this.prisma.utilisateur.findUnique({
            where: { id },
        });
        return user ? this.toDto(user) : null;
    }

    async update(id: string, data: UpdateUserData): Promise<UserProfileDto> {
        const user = await this.prisma.utilisateur.update({
            where: { id },
            data,
        });
        return this.toDto(user);
    }

    // Garantit qu'on n'expose jamais password_hash ni refresh_token_hash
    private toDto(user: Utilisateur): UserProfileDto {
        return {
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            telephone: user.telephone,
            role: user.role,
        };
    }
}
