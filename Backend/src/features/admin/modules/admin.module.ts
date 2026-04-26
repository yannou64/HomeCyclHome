import { Module } from '@nestjs/common';
import { AdminUsersController } from '../controllers/admin-users.controller';
import { AdminUsersPrismaRepository } from '../repositories/admin-users.prisma.repository';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';
import { DeleteUserUseCase } from '../use-cases/delete-user.use-case';
import { GetUsersUseCase } from '../use-cases/get-users.use-case';
import { UpdateUserUseCase } from '../use-cases/update-user.use-case';

// Token utilisé pour injecter l'interface IAdminUsersRepository
// Les interfaces disparaissent à la compilation — le token est l'identifiant runtime
export const ADMIN_USERS_REPO = 'ADMIN_USERS_REPO';

@Module({
    controllers: [AdminUsersController],
    providers: [
        // Lie le token à l'implémentation Prisma
        // Pour les tests ou un futur microservice : changer useClass suffit
        {
            provide: ADMIN_USERS_REPO,
            useClass: AdminUsersPrismaRepository,
        },

        // Chaque UseCase reçoit le repository via le token
        {
            provide: GetUsersUseCase,
            useFactory: (repo: AdminUsersPrismaRepository) =>
                new GetUsersUseCase(repo),
            inject: [ADMIN_USERS_REPO],
        },
        {
            provide: CreateUserUseCase,
            useFactory: (repo: AdminUsersPrismaRepository) =>
                new CreateUserUseCase(repo),
            inject: [ADMIN_USERS_REPO],
        },
        {
            provide: UpdateUserUseCase,
            useFactory: (repo: AdminUsersPrismaRepository) =>
                new UpdateUserUseCase(repo),
            inject: [ADMIN_USERS_REPO],
        },
        {
            provide: DeleteUserUseCase,
            useFactory: (repo: AdminUsersPrismaRepository) =>
                new DeleteUserUseCase(repo),
            inject: [ADMIN_USERS_REPO],
        },
    ],
})
export class AdminModule {}
