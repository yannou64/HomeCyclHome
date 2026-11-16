import {
    BadRequestException,
    NotFoundException,
    Injectable,
    Inject,
} from '@nestjs/common';
import {
    AUTH_REPO,
    type IAuthRepository,
} from '../repositories/auth.repository.interface';

@Injectable()
export class ConfirmEmailUseCase {
    constructor(@Inject(AUTH_REPO) private readonly repo: IAuthRepository) {}

    async execute(token: string): Promise<{ message: string }> {
        const user = await this.repo.findByConfirmationToken(token);

        if (!user) {
            throw new NotFoundException('Lien de confirmation invalide.');
        }

        if (user.tokenExpiresAt && user.tokenExpiresAt < new Date()) {
            throw new BadRequestException(
                'Ce lien a expiré. Inscris-toi à nouveau.',
            );
        }

        await this.repo.activate(user.id);

        return { message: 'Email confirmé. Tu peux maintenant te connecter.' };
    }
}
