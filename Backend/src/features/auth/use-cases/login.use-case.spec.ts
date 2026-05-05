import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
    AuthUserData,
    IAuthRepository,
} from '../repositories/auth.repository.interface';
import { LoginUseCase } from './login.use-case';

// bcrypt est un module natif — jest.spyOn ne peut pas redéfinir ses propriétés.
// On mocke le module entier pour pouvoir contrôler bcrypt.compare dans les tests.
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

const makeUser = (override: Partial<AuthUserData> = {}): AuthUserData => ({
    id: 'uuid-valide',
    email: 'test@gmail.com',
    prenom: 'Yannick',
    role: 'client',
    password_hash: 'hash-placeholder', // remplacé dans chaque test si besoin
    is_actif: true,
    email_confirmation_token: null,
    token_expires_at: null,
    ...override,
});

describe('LoginUseCase', () => {
    let useCase: LoginUseCase;
    let mockRepo: jest.Mocked<IAuthRepository>;
    let mockJwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

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
        mockJwtService = { sign: jest.fn().mockReturnValue('fake-token') };
        useCase = new LoginUseCase(
            mockRepo,
            mockJwtService as unknown as JwtService,
        );
    });

    it('devrait lever UnauthorizedException si email inconnu', async () => {
        // ARRANGE — aucun utilisateur pour cet email
        mockRepo.findByEmail.mockResolvedValue(null);

        // ACT + ASSERT
        await expect(
            useCase.execute({ email: 'inconnu@gmail.com', password: 'mdp' }),
        ).rejects.toThrow(UnauthorizedException);
    });

    it('devrait lever UnauthorizedException si mot de passe incorrect', async () => {
        // ARRANGE — utilisateur trouvé mais bcrypt.compare retourne false
        mockRepo.findByEmail.mockResolvedValue(makeUser());
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        // ACT + ASSERT
        await expect(
            useCase.execute({
                email: 'test@gmail.com',
                password: 'mauvais-mdp',
            }),
        ).rejects.toThrow(UnauthorizedException);
    });

    it('devrait lever ForbiddenException si compte non confirmé', async () => {
        // ARRANGE — mot de passe correct mais compte inactif
        mockRepo.findByEmail.mockResolvedValue(makeUser({ is_actif: false }));
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        // ACT + ASSERT
        await expect(
            useCase.execute({
                email: 'test@gmail.com',
                password: 'motdepasse123',
            }),
        ).rejects.toThrow(ForbiddenException);
    });

    it('devrait retourner userId, role, prenom et les tokens si credentials valides', async () => {
        // ARRANGE
        mockRepo.findByEmail.mockResolvedValue(makeUser());
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
        mockRepo.saveRefreshTokenHash.mockResolvedValue(undefined);

        // ACT
        const result = await useCase.execute({
            email: 'test@gmail.com',
            password: 'motdepasse123',
        });

        // ASSERT — le use case retourne les données ; le controller posera les cookies
        expect(result.userId).toBe('uuid-valide');
        expect(result.role).toBe('client');
        expect(result.prenom).toBe('Yannick');
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(mockRepo.saveRefreshTokenHash).toHaveBeenCalledWith(
            'uuid-valide',
            expect.any(String),
        );
    });
});
