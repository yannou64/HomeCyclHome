import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IAuthRepository } from '../repositories/auth.repository.interface';

export class ConfirmEmailUseCase {
    constructor(private readonly repo: IAuthRepository) {}

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
