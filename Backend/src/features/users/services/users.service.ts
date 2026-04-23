import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Utilisateur } from '../../../../generated/prisma';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserProfileDto } from '../dto/user-profile.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly prisma: PrismaService) {}

    async getProfile(userId: string): Promise<UserProfileDto> {
        this.logger.log(`[getProfile] userId=${userId}`);

        const utilisateur = await this.prisma.utilisateur.findUnique({
            where: { id: userId },
        });

        if (!utilisateur) {
            this.logger.warn(`[getProfile] utilisateur introuvable : ${userId}`);
            throw new NotFoundException('Utilisateur introuvable.');
        }

        this.logger.log(`[getProfile] succès : ${utilisateur.email}`);
        return this.toDto(utilisateur);
    }

    async updateProfile(
        userId: string,
        dto: UpdateUserDto,
    ): Promise<UserProfileDto> {
        this.logger.log(`[updateProfile] userId=${userId}`);

        try {
            const utilisateur = await this.prisma.utilisateur.update({
                where: { id: userId },
                data: {
                    nom: dto.nom,
                    prenom: dto.prenom,
                    telephone: dto.telephone,
                },
            });

            this.logger.log(`[updateProfile] succès : ${utilisateur.email}`);
            return this.toDto(utilisateur);
        } catch (e: unknown) {
            // Prisma code P2025 = enregistrement cible introuvable
            if (
                typeof e === 'object' &&
                e !== null &&
                (e as { code?: string }).code === 'P2025'
            ) {
                throw new NotFoundException('Utilisateur introuvable.');
            }
            throw e;
        }
    }

    // Garantit qu'on n'expose jamais password_hash ni refresh_token_hash
    private toDto(utilisateur: Utilisateur): UserProfileDto {
        return {
            id: utilisateur.id,
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
            email: utilisateur.email,
            telephone: utilisateur.telephone,
            role: utilisateur.role,
        };
    }
}
