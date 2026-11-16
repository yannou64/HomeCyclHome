import {
    ForbiddenException,
    UnauthorizedException,
    Injectable,
    Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { jwtAccessConfig, jwtRefreshConfig } from '../../../config/jwt.config';
import { LoginDto } from '../dto/input/login.dto';
import {
    AUTH_REPO,
    type IAuthRepository,
} from '../repositories/auth.repository.interface';

export type LoginResult = {
    userId: string;
    role: string;
    prenom: string;
    accessToken: string;
    refreshToken: string;
};

@Injectable()
export class LoginUseCase {
    constructor(
        @Inject(AUTH_REPO) private readonly repo: IAuthRepository,
        private readonly jwtService: JwtService,
    ) {}

    async execute(dto: LoginDto): Promise<LoginResult> {
        const user = await this.repo.findByEmail(dto.email);

        if (!user) {
            throw new UnauthorizedException('Email ou mot de passe incorrect.');
        }

        const isPasswordValid = await bcrypt.compare(
            dto.password,
            user.passwordHash,
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException('Email ou mot de passe incorrect.');
        }

        if (!user.isActif) {
            throw new ForbiddenException(
                'Confirme ton email avant de te connecter.',
            );
        }

        const payload = { sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload, jwtAccessConfig);
        const refreshToken = this.jwtService.sign(payload, jwtRefreshConfig);

        // Hash du refresh token avant stockage — jamais stocker le token brut
        const refresh_token_hash = await bcrypt.hash(refreshToken, 10);
        await this.repo.saveRefreshTokenHash(user.id, refresh_token_hash);

        return {
            userId: user.id,
            role: user.role,
            prenom: user.prenom,
            accessToken,
            refreshToken,
        };
    }
}
