import { ConflictException, NotFoundException } from '@nestjs/common';
import { AdminUserResponseDto } from '../dto/output/admin-user-response.dto';
import {
    IAdminUsersRepository,
    UpdateAdminUserData,
} from '../repositories/admin-users.repository.interface';

export class UpdateUserUseCase {
    constructor(private readonly repo: IAdminUsersRepository) {}

    async execute(
        targetUserId: string,
        data: UpdateAdminUserData,
    ): Promise<AdminUserResponseDto> {
        const user = await this.repo.findById(targetUserId);
        if (!user) {
            throw new NotFoundException(
                `Utilisateur avec l'id ${targetUserId} introuvable`,
            );
        }

        // Vérification uniquement si l'email change
        if (data.email) {
            const emailOwner = await this.repo.findByEmail(data.email);
            // Un autre utilisateur possède déjà cet email
            if (emailOwner && emailOwner.id !== targetUserId) {
                throw new ConflictException(
                    `L'adresse ${data.email} est déjà utilisée par un autre compte`,
                );
            }
        }

        return this.repo.update(targetUserId, data);
    }
}
