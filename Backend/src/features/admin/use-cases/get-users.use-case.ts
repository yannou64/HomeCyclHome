import { PaginatedUsersDto } from '../dto/admin-user.dto';
import {
    FindManyUsersParams,
    IAdminUsersRepository,
} from '../repositories/admin-users.repository.interface';

export class GetUsersUseCase {
    // Le UseCase reçoit le repository par injection — il ne sait pas que c'est Prisma
    constructor(private readonly repo: IAdminUsersRepository) {}

    async execute(params: FindManyUsersParams): Promise<PaginatedUsersDto> {
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
