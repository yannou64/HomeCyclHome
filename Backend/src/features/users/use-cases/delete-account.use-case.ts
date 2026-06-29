import { Inject, NotFoundException } from '@nestjs/common';
import { IUsersRepository } from '../repositories/users.repository.interface';
import { USERS_REPO } from '../users.module';

export class DeleteAccountUseCase {
    constructor(@Inject(USERS_REPO) private readonly repo: IUsersRepository) {}

    async execute(userId: string): Promise<void> {
        const user = await this.repo.findById(userId);
        if (!user) throw new NotFoundException('Compte introuvable.');

        await this.repo.deleteById(userId);
        // La cascade Prisma (onDelete: Cascade) supprime automatiquement les cycles
    }
}
