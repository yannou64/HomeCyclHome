import { Injectable } from '@nestjs/common';
import { Utilisateur } from '../../../generated/prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { estViolationCleEtrangere } from '../../../shared/database/violation-cle-etrangere';
import { UserProfileResponseDto } from '../dto/output/user-profile-response.dto';
import {
    IUsersRepository,
    ResultatSuppression,
    UpdateUserData,
} from './users.repository.interface';

@Injectable()
export class UsersPrismaRepository implements IUsersRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string): Promise<UserProfileResponseDto | null> {
        const user = await this.prisma.utilisateur.findUnique({
            where: { id },
        });
        return user ? this.toDto(user) : null;
    }

    async update(
        id: string,
        data: UpdateUserData,
    ): Promise<UserProfileResponseDto> {
        const user = await this.prisma.utilisateur.update({
            where: { id },
            data,
        });
        return this.toDto(user);
    }

    async compterInterventions(id: string): Promise<number> {
        // Aucun filtre sur le statut : une intervention Annulée compte aussi
        return this.prisma.intervention.count({
            where: { OR: [{ client_id: id }, { technicien_id: id }] },
        });
    }

    async deleteById(id: string): Promise<ResultatSuppression> {
        try {
            // Supprime aussi, par cascade en base, les cycles et les liens
            // PeutSeSituer de l'utilisateur (les lignes Adresse restent)
            await this.prisma.utilisateur.delete({ where: { id } });
            return { supprime: true };
        } catch (err) {
            // Filet : une intervention créée entre le contrôle du use case et
            // ce DELETE → la clé étrangère RESTRICT refuse, on le signale
            if (estViolationCleEtrangere(err)) return { supprime: false };
            throw err; // toute autre erreur est une vraie panne
        }
    }

    // Garantit qu'on n'expose jamais password_hash ni refresh_token_hash
    private toDto(user: Utilisateur): UserProfileResponseDto {
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
