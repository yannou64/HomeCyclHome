import {
    ForbiddenException,
    NotFoundException,
    Injectable,
    Inject,
} from '@nestjs/common';
import {
    ADMIN_USERS_REPO,
    type IAdminUsersRepository,
} from '../repositories/admin-users.repository.interface';

@Injectable()
export class DeleteUserUseCase {
    constructor(
        @Inject(ADMIN_USERS_REPO) private readonly repo: IAdminUsersRepository,
    ) {}

    async execute(
        requestingAdminId: string,
        targetUserId: string,
    ): Promise<void> {
        // Règle métier : un admin ne peut pas supprimer son propre compte
        if (requestingAdminId === targetUserId) {
            throw new ForbiddenException(
                'Un administrateur ne peut pas supprimer son propre compte',
            );
        }

        const user = await this.repo.findById(targetUserId);
        if (!user) {
            throw new NotFoundException(
                `Utilisateur avec l'id ${targetUserId} introuvable`,
            );
        }

        await this.repo.delete(targetUserId);
    }
}
