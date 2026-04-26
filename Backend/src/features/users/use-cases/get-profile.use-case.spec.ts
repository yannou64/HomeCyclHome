import { NotFoundException } from '@nestjs/common';
import { UserProfileDto } from '../dto/user-profile.dto';
import { IUsersRepository } from '../repositories/users.repository.interface';
import { GetProfileUseCase } from './get-profile.use-case';

// Fabrique un profil fictif pour les tests
const makeProfile = (
    override: Partial<UserProfileDto> = {},
): UserProfileDto => ({
    id: 'uuid-test',
    nom: 'Biot',
    prenom: 'Yannick',
    email: 'yannick@test.com',
    telephone: '0612345678',
    role: 'client',
    ...override,
});

describe('GetProfileUseCase', () => {
    let useCase: GetProfileUseCase;
    let mockRepo: jest.Mocked<IUsersRepository>;

    beforeEach(() => {
        // Mock de l'interface — on ne touche pas à Prisma
        mockRepo = {
            findById: jest.fn(),
            update: jest.fn(),
        };
        useCase = new GetProfileUseCase(mockRepo);
    });

    it('devrait retourner le profil si utilisateur trouvé', async () => {
        // ARRANGE
        mockRepo.findById.mockResolvedValue(makeProfile());

        // ACT
        const result = await useCase.execute('uuid-test');

        // ASSERT — données correctes, jamais de champ sensible
        expect(result.id).toBe('uuid-test');
        expect(result.prenom).toBe('Yannick');
        expect(result.email).toBe('yannick@test.com');
        expect(result).not.toHaveProperty('password_hash');
    });

    it('devrait lever NotFoundException si utilisateur introuvable', async () => {
        // ARRANGE — le repository retourne null (utilisateur inconnu)
        mockRepo.findById.mockResolvedValue(null);

        // ACT + ASSERT
        await expect(useCase.execute('uuid-inconnu')).rejects.toThrow(
            NotFoundException,
        );
    });

    it('devrait appeler le repository avec le bon userId', async () => {
        // ARRANGE
        mockRepo.findById.mockResolvedValue(makeProfile());

        // ACT
        await useCase.execute('uuid-test');

        // ASSERT — le use case transmet bien l'id au repository
        expect(mockRepo.findById).toHaveBeenCalledWith('uuid-test');
    });
});
