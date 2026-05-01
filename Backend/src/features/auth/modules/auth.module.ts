import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../../email/email.module';
import { EmailService } from '../../email/email.service';
import { AuthController } from '../controllers/auth.controller';
import { AuthPrismaRepository } from '../repositories/auth.prisma.repository';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { ConfirmEmailUseCase } from '../use-cases/confirm-email.use-case';
import { LoginUseCase } from '../use-cases/login.use-case';
import { LogoutUseCase } from '../use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case';
import { RegisterUseCase } from '../use-cases/register.use-case';

// Token utilisé pour injecter l'interface IAuthRepository
export const AUTH_REPO = 'AUTH_REPO';

@Module({
    imports: [PassportModule, JwtModule.register({}), EmailModule],
    controllers: [AuthController],
    providers: [
        // Lie le token à l'implémentation Prisma
        {
            provide: AUTH_REPO,
            useClass: AuthPrismaRepository,
        },

        {
            provide: RegisterUseCase,
            useFactory: (
                repo: AuthPrismaRepository,
                emailService: EmailService,
            ) => new RegisterUseCase(repo, emailService),
            inject: [AUTH_REPO, EmailService],
        },

        {
            provide: ConfirmEmailUseCase,
            useFactory: (repo: AuthPrismaRepository) =>
                new ConfirmEmailUseCase(repo),
            inject: [AUTH_REPO],
        },

        {
            provide: LoginUseCase,
            useFactory: (repo: AuthPrismaRepository, jwtService: JwtService) =>
                new LoginUseCase(repo, jwtService),
            inject: [AUTH_REPO, JwtService],
        },

        {
            provide: LogoutUseCase,
            useFactory: (repo: AuthPrismaRepository) => new LogoutUseCase(repo),
            inject: [AUTH_REPO],
        },

        {
            provide: RefreshTokenUseCase,
            useFactory: (repo: AuthPrismaRepository, jwtService: JwtService) =>
                new RefreshTokenUseCase(repo, jwtService),
            inject: [AUTH_REPO, JwtService],
        },

        JwtStrategy,
    ],
})
export class AuthModule {}
