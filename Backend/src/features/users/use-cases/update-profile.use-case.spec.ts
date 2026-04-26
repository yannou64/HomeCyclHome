import { NotFoundException } from '@nestjs/common';
import { UserProfileDto } from '../dto/user-profile.dto';
import { IUsersRepository } from '../repositories/users.repository.interface';
import { UpdateProfileUseCase } from './update-profile.use-case';

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

describe('UpdateProfileUseCase', () => {
    let useCase: UpdateProfileUseCase;
    let mockRepo: jest.Mocked<IUsersRepository>;

    beforeEach(() => {
        mockRepo = {
            findById: jest.fn(),
            update: jest.fn(),
        };
        useCase = new UpdateProfileUseCase(mockRepo);
    });

    it('devrait retourner le profil mis à jour', async () => {
        // ARRANGE — findById confirme que l'utilisateur existe, update retourne le résultat
        mockRepo.findById.mockResolvedValue(makeProfile());
        mockRepo.update.mockResolvedValue(makeProfile({ prenom: 'Jean' }));

        // ACT
        const result = await useCase.execute('uuid-test', { prenom: 'Jean' });

        // ASSERT
        expect(result.prenom).toBe('Jean');
        expect(result).not.toHaveProperty('password_hash');
    });

    it('devrait lever NotFoundException si utilisateur introuvable', async () => {
        // ARRANGE — findById retourne null : l'utilisateur n'existe pas
        mockRepo.findById.mockResolvedValue(null);

        // ACT + ASSERT — on attend l'exception avant même d'appeler update
        await expect(
            useCase.execute('uuid-inconnu', { prenom: 'Jean' }),
        ).rejects.toThrow(NotFoundException);

        expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('devrait transmettre uniquement les champs fournis au repository (patch partiel)', async () => {
        // ARRANGE
        mockRepo.findById.mockResolvedValue(makeProfile());
        mockRepo.update.mockResolvedValue(
            makeProfile({ telephone: '0698765432' }),
        );

        // ACT — on ne passe que le téléphone
        await useCase.execute('uuid-test', { telephone: '0698765432' });

        // ASSERT — le repository reçoit bien les données telles quelles
        expect(mockRepo.update).toHaveBeenCalledWith('uuid-test', {
            telephone: '0698765432',
        });
    });
});
