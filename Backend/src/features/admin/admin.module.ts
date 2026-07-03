import { Module } from '@nestjs/common';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminStatsController } from './controllers/admin-stats.controller';
import { AdminUsersPrismaRepository } from './repositories/admin-users.prisma.repository';
import { AdminStatsPrismaRepository } from './repositories/admin-stats.prisma.repository';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { DeleteUserUseCase } from './use-cases/delete-user.use-case';
import { GetUsersUseCase } from './use-cases/get-users.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { GetAdminStatsUseCase } from './use-cases/get-admin-stats.use-case';

// Les interfaces disparaissent à la compilation — les tokens sont les identifiants runtime
export const ADMIN_USERS_REPO = 'ADMIN_USERS_REPO';
export const ADMIN_STATS_REPO = 'ADMIN_STATS_REPO';

@Module({
    controllers: [AdminUsersController, AdminStatsController],
    providers: [
        // --- Utilisateurs ---
        {
            provide: ADMIN_USERS_REPO,
            useClass: AdminUsersPrismaRepository,
        },
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

        // --- Statistiques dashboard ---
        {
            provide: ADMIN_STATS_REPO,
            useClass: AdminStatsPrismaRepository,
        },
        {
            provide: GetAdminStatsUseCase,
            useFactory: (repo: AdminStatsPrismaRepository) =>
                new GetAdminStatsUseCase(repo),
            inject: [ADMIN_STATS_REPO],
        },
    ],
})
export class AdminModule {}
