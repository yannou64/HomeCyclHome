import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { EmailService } from '../../email/email.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { jwtAccessConfig, jwtRefreshConfig } from '../../../config/jwt.config';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../../../config/cookie.config';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
    ) {}

    async register(dto: RegisterDto): Promise<{ message: string }> {
        this.logger.log(`[register] tentative : ${dto.email}`);

        // Vérifie si l'email est déjà utilisé
        const existing = await this.prisma.utilisateur.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            this.logger.warn(`[register] email déjà utilisé : ${dto.email}`);
            throw new ConflictException('Cet email est déjà utilisé.');
        }

        // Hash du mot de passe — jamais stocker en clair
        const password_hash = await bcrypt.hash(dto.password, 12);

        // Génération d'un token de confirmation aléatoire
        const email_confirmation_token = crypto.randomBytes(32).toString('hex');
        const token_expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

        // Création de l'utilisateur en base
        const utilisateur = await this.prisma.utilisateur.create({
            data: {
                nom: dto.nom,
                prenom: dto.prenom,
                email: dto.email,
                password_hash,
                telephone: dto.telephone,
                email_confirmation_token,
                token_expires_at,
            },
        });

        // Envoi de l'email de confirmation
        await this.emailService.sendConfirmationEmail(
            utilisateur.email,
            utilisateur.prenom,
            email_confirmation_token,
        );

        this.logger.log(
            `[register] succès : ${utilisateur.email} (id: ${utilisateur.id})`,
        );
        return {
            message:
                'Inscription réussie. Vérifie ton email pour confirmer ton compte.',
        };
    }

    async confirmEmail(token: string): Promise<{ message: string }> {
        this.logger.log(
            `[confirmEmail] tentative : token=${token.slice(0, 8)}...`,
        );

        // Recherche de l'utilisateur par son token
        const utilisateur = await this.prisma.utilisateur.findUnique({
            where: { email_confirmation_token: token },
        });
        if (!utilisateur) {
            this.logger.warn(
                `[confirmEmail] token invalide : ${token.slice(0, 8)}...`,
            );
            throw new NotFoundException('Lien de confirmation invalide.');
        }

        // Vérifie que le lien n'est pas expiré
        if (
            utilisateur.token_expires_at &&
            utilisateur.token_expires_at < new Date()
        ) {
            this.logger.warn(
                `[confirmEmail] token expiré : ${utilisateur.email}`,
            );
            throw new BadRequestException(
                'Ce lien a expiré. Inscris-toi à nouveau.',
            );
        }

        // Active le compte et efface le token
        await this.prisma.utilisateur.update({
            where: { id: utilisateur.id },
            data: {
                is_actif: true,
                email_confirmation_token: null,
                token_expires_at: null,
            },
        });

        this.logger.log(`[confirmEmail] succès : ${utilisateur.email}`);
        return { message: 'Email confirmé. Tu peux maintenant te connecter.' };
    }

    async login(dto: LoginDto, res: Response): Promise<AuthResponseDto> {
        this.logger.log(`[login] tentative : ${dto.email}`);

        // Recherche de l'utilisateur
        const utilisateur = await this.prisma.utilisateur.findUnique({
            where: { email: dto.email },
        });
        if (!utilisateur) {
            this.logger.warn(`[login] email inconnu : ${dto.email}`);
            throw new UnauthorizedException('Email ou mot de passe incorrect.');
        }

        // Vérification du mot de passe
        const isPasswordValid = await bcrypt.compare(
            dto.password,
            utilisateur.password_hash,
        );
        if (!isPasswordValid) {
            this.logger.warn(`[login] mot de passe incorrect : ${dto.email}`);
            throw new UnauthorizedException('Email ou mot de passe incorrect.');
        }

        // Bloque la connexion si le compte n'est pas confirmé
        if (!utilisateur.is_actif) {
            this.logger.warn(`[login] compte non confirmé : ${dto.email}`);
            throw new ForbiddenException(
                'Confirme ton email avant de te connecter.',
            );
        }

        // Génération des tokens
        const payload = { sub: utilisateur.id, role: utilisateur.role };
        const accessToken = this.jwtService.sign(payload, jwtAccessConfig);
        const refreshToken = this.jwtService.sign(payload, jwtRefreshConfig);

        // Stockage du hash du refresh token en base
        const refresh_token_hash = await bcrypt.hash(refreshToken, 10);
        await this.prisma.utilisateur.update({
            where: { id: utilisateur.id },
            data: { refresh_token_hash, date_dernier_login: new Date() },
        });

        // Pose des cookies HttpOnly
        res.cookie('access_token', accessToken, ACCESS_COOKIE);
        res.cookie('refresh_token', refreshToken, REFRESH_COOKIE);

        this.logger.log(
            `[login] succès : ${utilisateur.email} (rôle: ${utilisateur.role})`,
        );
        return { userId: utilisateur.id, role: utilisateur.role, prenom: utilisateur.prenom };
    }

    async logout(userId: string, res: Response): Promise<{ message: string }> {
        this.logger.log(`[logout] appel : userId=${userId}`);

        // Invalide le refresh token en base
        await this.prisma.utilisateur.update({
            where: { id: userId },
            data: { refresh_token_hash: null },
        });

        // Efface les cookies
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        this.logger.log(`[logout] succès : userId=${userId}`);
        return { message: 'Déconnecté.' };
    }
}
