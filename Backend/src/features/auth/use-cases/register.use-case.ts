import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from '../../email/email.service';
import { RegisterDto } from '../dto/register.dto';
import { IAuthRepository } from '../repositories/auth.repository.interface';

export class RegisterUseCase {
    constructor(
        private readonly repo: IAuthRepository,
        private readonly emailService: EmailService,
    ) {}

    async execute(dto: RegisterDto): Promise<{ message: string }> {
        const emailTaken = await this.repo.existsByEmail(dto.email);
        if (emailTaken) {
            throw new ConflictException('Cet email est déjà utilisé.');
        }

        const password_hash = await bcrypt.hash(dto.password, 12);
        const email_confirmation_token = crypto.randomBytes(32).toString('hex');
        const token_expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

        const user = await this.repo.create({
            nom: dto.nom,
            prenom: dto.prenom,
            email: dto.email,
            password_hash,
            telephone: dto.telephone,
            email_confirmation_token,
            token_expires_at,
        });

        await this.emailService.sendConfirmationEmail(
            user.email,
            user.prenom,
            email_confirmation_token,
        );

        return {
            message:
                'Inscription réussie. Vérifie ton email pour confirmer ton compte.',
        };
    }
}
