import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IAuthRepository } from '../repositories/auth.repository.interface';
import { RefreshTokenUseCase } from './refresh-token.use-case';

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

const VALID_PAYLOAD = { sub: 'uuid-utilisateur', role: 'client' };

describe('RefreshTokenUseCase', () => {
    let useCase: RefreshTokenUseCase;
    let mockRepo: jest.Mocked<IAuthRepository>;
    let mockJwtService: jest.Mocked<Pick<JwtService, 'sign' | 'verify'>>;

    beforeEach(() => {
        mockRepo = {
            existsByEmail: jest.fn(),
            findByEmail: jest.fn(),
            findByConfirmationToken: jest.fn(),
            findRefreshHashById: jest.fn(),
            create: jest.fn(),
            activate: jest.fn(),
            saveRefreshTokenHash: jest.fn(),
            clearRefreshTokenHash: jest.fn(),
        };
        mockJwtService = {
            sign: jest.fn().mockReturnValue('nouveau-access-token'),
            verify: jest.fn(),
        };
        useCase = new RefreshTokenUseCase(
            mockRepo,
            mockJwtService as unknown as JwtService,
        );
    });

    it('devrait lever UnauthorizedException si le refresh token a une signature invalide', async () => {
        // ARRANGE — jwtService.verify lève une erreur (signature incorrecte)
        mockJwtService.verify.mockImplementation(() => {
            throw new Error('invalid signature');
        });

        // ACT + ASSERT
        await expect(
            useCase.execute('token-falsifie'),
        ).rejects.toThrow(UnauthorizedException);
    });

    it('devrait lever UnauthorizedException si le refresh token est expiré', async () => {
        // ARRANGE — jwtService.verify lève une erreur (token expiré)
        mockJwtService.verify.mockImplementation(() => {
            throw new Error('jwt expired');
        });

        // ACT + ASSERT
        await expect(
            useCase.execute('token-expire'),
        ).rejects.toThrow(UnauthorizedException);
    });

    it('devrait lever UnauthorizedException si aucun hash en base (session révoquée)', async () => {
        // ARRANGE — token JWT valide, mais l'utilisateur a fait logout (hash null)
        mockJwtService.verify.mockReturnValue(VALID_PAYLOAD);
        mockRepo.findRefreshHashById.mockResolvedValue(null);

        // ACT + ASSERT
        await expect(
            useCase.execute('token-jwt-valide'),
        ).rejects.toThrow(UnauthorizedException);
    });

    it('devrait lever UnauthorizedException si le token ne correspond pas au hash stocké', async () => {
        // ARRANGE — JWT valide, hash en base, mais bcrypt.compare retourne false
        // (token révoqué ou manipulé)
        mockJwtService.verify.mockReturnValue(VALID_PAYLOAD);
        mockRepo.findRefreshHashById.mockResolvedValue('hash-en-base');
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        // ACT + ASSERT
        await expect(
            useCase.execute('token-revoque'),
        ).rejects.toThrow(UnauthorizedException);
    });

    it('devrait retourner un nouveau accessToken si tout est valide', async () => {
        // ARRANGE — tout est en ordre
        mockJwtService.verify.mockReturnValue(VALID_PAYLOAD);
        mockRepo.findRefreshHashById.mockResolvedValue('hash-en-base');
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        // ACT
        const result = await useCase.execute('refresh-token-valide');

        // ASSERT
        expect(result.accessToken).toBe('nouveau-access-token');
        expect(mockJwtService.sign).toHaveBeenCalledWith(
            { sub: VALID_PAYLOAD.sub, role: VALID_PAYLOAD.role },
            expect.anything(), // jwtAccessConfig
        );
    });
});
