import {
    ConflictException,
    NotFoundException,
    Injectable,
    Inject,
} from '@nestjs/common';
import {
    USERS_REPO,
    type IUsersRepository,
} from '../repositories/users.repository.interface';

// Message renvoyé au client quand son compte est lié à des interventions
// (spec : cas d'utilisation « (Tous) Supprimer un compte 2.0 »).
export const MESSAGE_COMPTE_CLIENT_LIE =
    'Votre compte est lié à des interventions et ne peut pas être supprimé pour le moment. Contactez-nous pour toute demande sur vos données.';

@Injectable()
export class DeleteAccountUseCase {
    constructor(@Inject(USERS_REPO) private readonly repo: IUsersRepository) {}

    async execute(userId: string): Promise<void> {
        const user = await this.repo.findById(userId);
        if (!user) throw new NotFoundException('Compte introuvable.');

        // 1. Contrôle avant toute écriture : le chemin normal du refus
        if ((await this.repo.compterInterventions(userId)) > 0) {
            throw new ConflictException(MESSAGE_COMPTE_CLIENT_LIE);
        }

        // 2. Suppression. La base peut encore la refuser si une intervention a
        //    été créée entre le contrôle et ce DELETE : même refus, même message.
        //    Aucune session n'est fermée ici : sur un refus, le client reste connecté.
        const resultat = await this.repo.deleteById(userId);
        if (!resultat.supprime) {
            throw new ConflictException(MESSAGE_COMPTE_CLIENT_LIE);
        }
    }
}
