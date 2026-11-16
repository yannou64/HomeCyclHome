import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import {
    USERS_REPO,
    type IUsersRepository,
} from '../repositories/users.repository.interface';

@Injectable()
export class DeleteAccountUseCase {
    constructor(@Inject(USERS_REPO) private readonly repo: IUsersRepository) {}

    async execute(userId: string): Promise<void> {
        const user = await this.repo.findById(userId);
        if (!user) throw new NotFoundException('Compte introuvable.');

        await this.repo.deleteById(userId);
        // La cascade Prisma (onDelete: Cascade) supprime automatiquement les cycles
    }
}
