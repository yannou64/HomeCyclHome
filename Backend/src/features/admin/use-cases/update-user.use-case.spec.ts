import { ConflictException, NotFoundException } from '@nestjs/common';
import { AdminUserDto } from '../dto/admin-user.dto';
import { IAdminUsersRepository } from '../repositories/admin-users.repository.interface';
import { UpdateUserUseCase } from './update-user.use-case';

const existingUser: AdminUserDto = {
    id: 'user-123',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@email.com',
    telephone: '0601020304',
    role: 'technicien',
    isActif: true,
    dateCreation: new Date(),
};

describe('UpdateUserUseCase', () => {
    let useCase: UpdateUserUseCase;
    let mockRepo: jest.Mocked<IAdminUsersRepository>;

    beforeEach(() => {
        mockRepo = {
            findMany: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        useCase = new UpdateUserUseCase(mockRepo);
    });

    it('devrait mettre à jour un utilisateur existant', async () => {
        mockRepo.findById.mockResolvedValue(existingUser);
        mockRepo.findByEmail.mockResolvedValue(null);
        mockRepo.update.mockResolvedValue({ ...existingUser, nom: 'Martin' });

        const result = await useCase.execute('user-123', { nom: 'Martin' });

        expect(mockRepo.update).toHaveBeenCalledWith('user-123', {
            nom: 'Martin',
        });
        expect(result.nom).toBe('Martin');
    });

    it("devrait lever NotFoundException si l'utilisateur n'existe pas", async () => {
        mockRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('ghost-999', { nom: 'Martin' }),
        ).rejects.toThrow(NotFoundException);

        expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('devrait lever ConflictException si le nouvel email appartient à un autre utilisateur', async () => {
        const otherUser: AdminUserDto = {
            ...existingUser,
            id: 'other-456',
            email: 'other@email.com',
        };
        mockRepo.findById.mockResolvedValue(existingUser);
        // Le nouvel email est déjà pris par un autre compte
        mockRepo.findByEmail.mockResolvedValue(otherUser);

        await expect(
            useCase.execute('user-123', { email: 'other@email.com' }),
        ).rejects.toThrow(ConflictException);

        expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it("devrait autoriser la mise à jour sans changer l'email (pas de vérification)", async () => {
        mockRepo.findById.mockResolvedValue(existingUser);
        mockRepo.update.mockResolvedValue({ ...existingUser, nom: 'Martin' });

        await useCase.execute('user-123', { nom: 'Martin' });

        // Pas d'email dans le payload → findByEmail ne doit pas être appelé
        expect(mockRepo.findByEmail).not.toHaveBeenCalled();
    });
});
