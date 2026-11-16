import { Module } from '@nestjs/common';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminStatsController } from './controllers/admin-stats.controller';
import { AdminUsersPrismaRepository } from './repositories/admin-users.prisma.repository';
import { AdminStatsPrismaRepository } from './repositories/admin-stats.prisma.repository';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { DeleteUserUseCase } from './use-cases/delete-user.use-case';
import { GetUsersUseCase } from './use-cases/get-users.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { ADMIN_USERS_REPO } from './repositories/admin-users.repository.interface';
import { ADMIN_STATS_REPO } from './repositories/admin-stats.repository.interface';
import { GetAdminStatsUseCase } from './use-cases/get-admin-stats.use-case';

@Module({
    controllers: [AdminUsersController, AdminStatsController],
    providers: [
        // --- Utilisateurs ---
        {
            provide: ADMIN_USERS_REPO,
            useClass: AdminUsersPrismaRepository,
        },
        GetUsersUseCase,
        CreateUserUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,

        // --- Statistiques dashboard ---
        {
            provide: ADMIN_STATS_REPO,
            useClass: AdminStatsPrismaRepository,
        },
        GetAdminStatsUseCase,
    ],
})
export class AdminModule {}
