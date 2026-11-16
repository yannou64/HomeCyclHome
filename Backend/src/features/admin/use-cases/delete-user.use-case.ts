import {
    ConflictException,
    ForbiddenException,
    NotFoundException,
    Injectable,
    Inject,
} from '@nestjs/common';
import {
    ADMIN_USERS_REPO,
    type IAdminUsersRepository,
} from '../repositories/admin-users.repository.interface';

// Message renvoyé à l'admin quand le compte visé est lié à des interventions
// (spec : cas d'utilisation « (Tous) Supprimer un compte 2.0 »).
export const MESSAGE_COMPTE_LIE_ADMIN =
    'Ce compte est lié à des interventions : il ne peut pas être supprimé.';

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

        // 1. Contrôle avant toute écriture : client OU technicien référencé
        if ((await this.repo.compterInterventions(targetUserId)) > 0) {
            throw new ConflictException(MESSAGE_COMPTE_LIE_ADMIN);
        }

        // 2. Suppression, avec le filet de la clé étrangère (course possible
        //    entre le contrôle et le DELETE) traduit en ce même refus
        const resultat = await this.repo.delete(targetUserId);
        if (!resultat.supprime) {
            throw new ConflictException(MESSAGE_COMPTE_LIE_ADMIN);
        }
    }
}
