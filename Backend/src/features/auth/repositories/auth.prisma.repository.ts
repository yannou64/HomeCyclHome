import { Injectable } from '@nestjs/common';
import { Utilisateur } from '../../../../generated/prisma';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import {
    AuthUserData,
    CreateUserData,
    IAuthRepository,
} from './auth.repository.interface';

@Injectable()
export class AuthPrismaRepository implements IAuthRepository {
    constructor(private readonly prisma: PrismaService) {}

    async existsByEmail(email: string): Promise<boolean> {
        const count = await this.prisma.utilisateur.count({ where: { email } });
        return count > 0;
    }

    async findByEmail(email: string): Promise<AuthUserData | null> {
        const user = await this.prisma.utilisateur.findUnique({
            where: { email },
        });
        return user ? this.toData(user) : null;
    }

    async findByConfirmationToken(token: string): Promise<AuthUserData | null> {
        const user = await this.prisma.utilisateur.findUnique({
            where: { email_confirmation_token: token },
        });
        return user ? this.toData(user) : null;
    }

    async create(data: CreateUserData): Promise<AuthUserData> {
        const user = await this.prisma.utilisateur.create({
            data: {
                nom: data.nom,
                prenom: data.prenom,
                email: data.email,
                telephone: data.telephone,
                password_hash: data.passwordHash,
                email_confirmation_token: data.emailConfirmationToken,
                token_expires_at: data.tokenExpiresAt,
            },
        });
        return this.toData(user);
    }

    async activate(userId: string): Promise<void> {
        await this.prisma.utilisateur.update({
            where: { id: userId },
            data: {
                is_actif: true,
                email_confirmation_token: null,
                token_expires_at: null,
            },
        });
    }

    async findRefreshHashById(userId: string): Promise<string | null> {
        const user = await this.prisma.utilisateur.findUnique({
            where: { id: userId },
            select: { refresh_token_hash: true },
        });
        return user?.refresh_token_hash ?? null;
    }

    async saveRefreshTokenHash(userId: string, hash: string): Promise<void> {
        await this.prisma.utilisateur.update({
            where: { id: userId },
            data: { refresh_token_hash: hash, date_dernier_login: new Date() },
        });
    }

    async clearRefreshTokenHash(userId: string): Promise<void> {
        await this.prisma.utilisateur.update({
            where: { id: userId },
            data: { refresh_token_hash: null },
        });
    }

    // Mappe le modèle Prisma vers AuthUserData — expose uniquement ce dont les use cases ont besoin
    private toData(user: Utilisateur): AuthUserData {
        return {
            id: user.id,
            email: user.email,
            prenom: user.prenom,
            role: user.role,
            passwordHash: user.password_hash,
            isActif: user.is_actif,
            emailConfirmationToken: user.email_confirmation_token,
            tokenExpiresAt: user.token_expires_at,
        };
    }
}
