import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersPrismaRepository } from './repositories/users.prisma.repository';
import { DeleteAccountUseCase } from './use-cases/delete-account.use-case';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';
import { USERS_REPO } from './repositories/users.repository.interface';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';

@Module({
    controllers: [UsersController],
    providers: [
        // Lie le token à l'implémentation Prisma
        {
            provide: USERS_REPO,
            useClass: UsersPrismaRepository,
        },

        // Use cases : Nest les construit et leur injecte le repository par le jeton
        GetProfileUseCase,
        UpdateProfileUseCase,
        DeleteAccountUseCase,
    ],
})
export class UsersModule {}
