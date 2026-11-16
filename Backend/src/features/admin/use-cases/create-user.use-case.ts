import { ConflictException, Injectable, Inject } from '@nestjs/common';
import { AdminUserResponseDto } from '../dto/output/admin-user-response.dto';
import {
    ADMIN_USERS_REPO,
    type CreateAdminUserData,
    type IAdminUsersRepository,
} from '../repositories/admin-users.repository.interface';

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject(ADMIN_USERS_REPO) private readonly repo: IAdminUsersRepository,
    ) {}

    async execute(data: CreateAdminUserData): Promise<AdminUserResponseDto> {
        // Règle métier : l'email doit être unique dans le système
        const existing = await this.repo.findByEmail(data.email);
        if (existing) {
            throw new ConflictException(
                `Un compte existe déjà avec l'adresse ${data.email}`,
            );
        }

        // Le hashage du mot de passe est délégué à l'implémentation Prisma
        // (c'est de l'infrastructure, pas de la logique métier)
        return this.repo.create(data);
    }
}
