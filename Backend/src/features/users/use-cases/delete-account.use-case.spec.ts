import { NotFoundException } from '@nestjs/common';
import { UserProfileDto } from '../dto/user-profile.dto';
import { IUsersRepository } from '../repositories/users.repository.interface';
import { DeleteAccountUseCase } from './delete-account.use-case';

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

describe('DeleteAccountUseCase', () => {
    let useCase: DeleteAccountUseCase;
    let mockRepo: jest.Mocked<IUsersRepository>;

    beforeEach(() => {
        mockRepo = {
            findById: jest.fn(),
            update: jest.fn(),
            deleteById: jest.fn(),
        };
        useCase = new DeleteAccountUseCase(mockRepo);
    });

    it('devrait supprimer le compte si utilisateur trouvé', async () => {
        // ARRANGE — l'utilisateur existe
        mockRepo.findById.mockResolvedValue(makeProfile());
        mockRepo.deleteById.mockResolvedValue(undefined);

        // ACT
        await useCase.execute('uuid-test');

        // ASSERT — deleteById appelé avec le bon id
        expect(mockRepo.deleteById).toHaveBeenCalledWith('uuid-test');
    });

    it('devrait lever NotFoundException si utilisateur introuvable', async () => {
        // ARRANGE — le repository ne connaît pas cet id
        mockRepo.findById.mockResolvedValue(null);

        // ACT + ASSERT — deleteById ne doit jamais être appelé
        await expect(useCase.execute('uuid-inconnu')).rejects.toThrow(
            NotFoundException,
        );
        expect(mockRepo.deleteById).not.toHaveBeenCalled();
    });
});
