import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { EmailService } from '../../email/email.service';
import type { RegisterDto } from '../dto/input/register.dto';
import type { IAuthRepository } from '../repositories/auth.repository.interface';

export class RegisterUseCase {
    constructor(
        private readonly repo: IAuthRepository,
        // Pick : le use case ne dépend que de la méthode qu'il appelle.
        private readonly emailService: Pick<
            EmailService,
            'sendConfirmationEmail'
        >,
    ) {}

    async execute(dto: RegisterDto): Promise<{ message: string }> {
        const emailTaken = await this.repo.existsByEmail(dto.email);
        if (emailTaken) {
            throw new ConflictException('Cet email est déjà utilisé.');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);
        const emailConfirmationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

        const user = await this.repo.create({
            nom: dto.nom,
            prenom: dto.prenom,
            email: dto.email,
            passwordHash,
            telephone: dto.telephone,
            emailConfirmationToken,
            tokenExpiresAt,
        });

        await this.emailService.sendConfirmationEmail(
            user.email,
            user.prenom,
            emailConfirmationToken,
        );

        return {
            message:
                'Inscription réussie. Vérifie ton email pour confirmer ton compte.',
        };
    }
}
