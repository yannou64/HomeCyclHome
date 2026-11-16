import { Injectable, Inject } from '@nestjs/common';
import { PaginatedUsersResponseDto } from '../dto/output/paginated-users-response.dto';
import {
    ADMIN_USERS_REPO,
    type FindManyUsersParams,
    type IAdminUsersRepository,
} from '../repositories/admin-users.repository.interface';

@Injectable()
export class GetUsersUseCase {
    // Le UseCase reçoit le repository par injection — il ne sait pas que c'est Prisma
    constructor(
        @Inject(ADMIN_USERS_REPO) private readonly repo: IAdminUsersRepository,
    ) {}

    async execute(
        params: FindManyUsersParams,
    ): Promise<PaginatedUsersResponseDto> {
        const { users, total } = await this.repo.findMany(params);

        return {
            data: users,
            meta: {
                total,
                page: params.page,
                limit: params.limit,
                // Math.ceil arrondit au supérieur : 21/10 = 2.1 → 3 pages
                totalPages: Math.ceil(total / params.limit),
            },
        };
    }
}
