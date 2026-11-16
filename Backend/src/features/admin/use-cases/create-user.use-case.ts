import { ConflictException, Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PASSWORD_HASH_ROUNDS } from '../../../config/password.config';
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

        // Le mot de passe est haché ici, comme à l'inscription : le repository
        // ne reçoit jamais le mot de passe en clair.
        const { password, ...identite } = data;
        const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
        return this.repo.create({ ...identite, passwordHash });
    }
}
