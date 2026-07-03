import { IAuthRepository } from '../repositories/auth.repository.interface';
import { LogoutUseCase } from './logout.use-case';

describe('LogoutUseCase', () => {
    let useCase: LogoutUseCase;
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
        useCase = new LogoutUseCase(mockRepo);
    });

    it('devrait invalider le refresh token en base', async () => {
        // ARRANGE
        mockRepo.clearRefreshTokenHash.mockResolvedValue(undefined);

        // ACT
        await useCase.execute('uuid-utilisateur');

        // ASSERT — le cookie est géré par le controller, pas par le use case
        expect(mockRepo.clearRefreshTokenHash).toHaveBeenCalledWith(
            'uuid-utilisateur',
        );
    });
});
