import { ConflictException } from '@nestjs/common';
import { AdminUserDto } from '../dto/admin-user.dto';
import {
    CreateAdminUserData,
    IAdminUsersRepository,
} from '../repositories/admin-users.repository.interface';

export class CreateUserUseCase {
    constructor(private readonly repo: IAdminUsersRepository) {}

    async execute(data: CreateAdminUserData): Promise<AdminUserDto> {
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
