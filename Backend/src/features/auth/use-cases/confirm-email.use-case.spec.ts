import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
    AuthUserData,
    IAuthRepository,
} from '../repositories/auth.repository.interface';
import { ConfirmEmailUseCase } from './confirm-email.use-case';

const makeUser = (override: Partial<AuthUserData> = {}): AuthUserData => ({
    id: 'uuid-test',
    email: 'test@gmail.com',
    prenom: 'Yannick',
    role: 'client',
    passwordHash: 'hash',
    isActif: false,
    emailConfirmationToken: 'token-valide',
    tokenExpiresAt: new Date('2099-01-01'), // futur → valide par défaut
    ...override,
});

describe('ConfirmEmailUseCase', () => {
    let useCase: ConfirmEmailUseCase;
    let mockRepo: jest.Mocked<IAuthRepository>;

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
        useCase = new ConfirmEmailUseCase(mockRepo);
    });

    it('devrait lever NotFoundException si token inconnu', async () => {
        // ARRANGE — aucun utilisateur trouvé pour ce token
        mockRepo.findByConfirmationToken.mockResolvedValue(null);

        // ACT + ASSERT
        await expect(useCase.execute('token-inconnu')).rejects.toThrow(
            NotFoundException,
        );
        expect(mockRepo.activate).not.toHaveBeenCalled();
    });

    it('devrait lever BadRequestException si token expiré', async () => {
        // ARRANGE — token trouvé mais expiré
        mockRepo.findByConfirmationToken.mockResolvedValue(
            makeUser({ tokenExpiresAt: new Date('2000-01-01') }),
        );

        // ACT + ASSERT
        await expect(useCase.execute('token-expiré')).rejects.toThrow(
            BadRequestException,
        );
        expect(mockRepo.activate).not.toHaveBeenCalled();
    });

    it('devrait activer le compte si token valide et non expiré', async () => {
        // ARRANGE — token valide, date dans le futur
        mockRepo.findByConfirmationToken.mockResolvedValue(makeUser());
        mockRepo.activate.mockResolvedValue(undefined);

        // ACT
        const result = await useCase.execute('token-valide');

        // ASSERT
        expect(result.message).toContain('confirmé');
        expect(mockRepo.activate).toHaveBeenCalledWith('uuid-test');
    });
});
