import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersPrismaRepository } from './repositories/users.prisma.repository';
import { DeleteAccountUseCase } from './use-cases/delete-account.use-case';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';

// Token utilisé pour injecter l'interface IUsersRepository
// Les interfaces disparaissent à la compilation — le token est l'identifiant runtime
export const USERS_REPO = 'USERS_REPO';

@Module({
    controllers: [UsersController],
    providers: [
        // Lie le token à l'implémentation Prisma
        // Pour les tests ou un futur microservice : changer useClass suffit
        {
            provide: USERS_REPO,
            useClass: UsersPrismaRepository,
        },

        // Chaque UseCase reçoit le repository via le token
        {
            provide: GetProfileUseCase,
            useFactory: (repo: UsersPrismaRepository) =>
                new GetProfileUseCase(repo),
            inject: [USERS_REPO],
        },
        {
            provide: UpdateProfileUseCase,
            useFactory: (repo: UsersPrismaRepository) =>
                new UpdateProfileUseCase(repo),
            inject: [USERS_REPO],
        },
        {
            provide: DeleteAccountUseCase,
            useFactory: (repo: UsersPrismaRepository) =>
                new DeleteAccountUseCase(repo),
            inject: [USERS_REPO],
        },
    ],
})
export class UsersModule {}
