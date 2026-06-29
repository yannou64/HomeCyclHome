import { ConflictException } from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import { IAuthRepository } from '../repositories/auth.repository.interface';
import { RegisterUseCase } from './register.use-case';

describe('RegisterUseCase', () => {
    let useCase: RegisterUseCase;
    let mockRepo: jest.Mocked<IAuthRepository>;
    let mockEmailService: jest.Mocked<
        Pick<EmailService, 'sendConfirmationEmail'>
    >;

    beforeEach(() => {
        mockRepo = {
            existsByEmail: jest.fn(),
            findByEmail: jest.fn(),
            findByConfirmationToken: jest.fn(),
            create: jest.fn(),
            activate: jest.fn(),
            findRefreshHashById: jest.fn(),
            saveRefreshTokenHash: jest.fn(),
            clearRefreshTokenHash: jest.fn(),
        };
        mockEmailService = { sendConfirmationEmail: jest.fn() };
        useCase = new RegisterUseCase(
            mockRepo,
            mockEmailService as unknown as EmailService,
        );
    });

    it('devrait lever ConflictException si email déjà utilisé', async () => {
        // ARRANGE — l'email existe déjà en base
        mockRepo.existsByEmail.mockResolvedValue(true);

        // ACT + ASSERT
        await expect(
            useCase.execute({
                prenom: 'Yannick',
                nom: 'Biot',
                email: 'test@gmail.com',
                telephone: '0612345678',
                password: 'motdepasse123',
            }),
        ).rejects.toThrow(ConflictException);

        expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('devrait créer le compte et envoyer un email de confirmation', async () => {
        // ARRANGE — email disponible
        mockRepo.existsByEmail.mockResolvedValue(false);
        mockRepo.create.mockResolvedValue({
            id: 'nouvel-uuid',
            email: 'nouveau@gmail.com',
            prenom: 'Yannick',
            role: 'client',
            passwordHash: 'hash',
            isActif: false,
            emailConfirmationToken: 'token-abc',
            tokenExpiresAt: new Date(),
        });
        mockEmailService.sendConfirmationEmail.mockResolvedValue(undefined);

        // ACT
        const result = await useCase.execute({
            prenom: 'Yannick',
            nom: 'Biot',
            email: 'nouveau@gmail.com',
            telephone: '0612345678',
            password: 'motdepasse123',
        });

        // ASSERT
        expect(result.message).toContain('Inscription réussie');
        expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalledTimes(1);
        expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalledWith(
            'nouveau@gmail.com',
            'Yannick',
            expect.any(String), // token généré aléatoirement
        );
    });
});
