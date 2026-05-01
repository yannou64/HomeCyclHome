import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { jwtAccessConfig } from '../../../config/jwt.config';
import { IAuthRepository } from '../repositories/auth.repository.interface';

export class RefreshTokenUseCase {
    constructor(
        private readonly repo: IAuthRepository,
        private readonly jwtService: JwtService,
    ) {}

    async execute(refreshToken: string): Promise<{ accessToken: string }> {
        // 1. Vérifier la signature JWT et l'expiration avec le secret refresh
        let payload: { sub: string; role: string };
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch {
            throw new UnauthorizedException('Refresh token invalide ou expiré.');
        }

        // 2. Vérifier que la session est toujours active en base
        // (null = logout déjà effectué → token révoqué)
        const storedHash = await this.repo.findRefreshHashById(payload.sub);
        if (!storedHash) {
            throw new UnauthorizedException('Session expirée.');
        }

        // 3. Comparer le token reçu avec le hash stocké
        // (protège contre la réutilisation d'un ancien token révoqué)
        const isValid = await bcrypt.compare(refreshToken, storedHash);
        if (!isValid) {
            throw new UnauthorizedException('Refresh token invalide.');
        }

        // 4. Générer un nouveau access token de 15 minutes
        const accessToken = this.jwtService.sign(
            { sub: payload.sub, role: payload.role },
            jwtAccessConfig,
        );

        return { accessToken };
    }
}
