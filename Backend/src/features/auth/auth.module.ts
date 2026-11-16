import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../email/email.module';
import { AuthController } from './controllers/auth.controller';
import { AuthPrismaRepository } from './repositories/auth.prisma.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfirmEmailUseCase } from './use-cases/confirm-email.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { AUTH_REPO } from './repositories/auth.repository.interface';
import { RegisterUseCase } from './use-cases/register.use-case';

@Module({
    imports: [PassportModule, JwtModule.register({}), EmailModule],
    controllers: [AuthController],
    providers: [
        // Lie le token à l'implémentation Prisma
        {
            provide: AUTH_REPO,
            useClass: AuthPrismaRepository,
        },

        RegisterUseCase,

        ConfirmEmailUseCase,

        LoginUseCase,

        LogoutUseCase,

        RefreshTokenUseCase,

        JwtStrategy,
    ],
})
export class AuthModule {}
