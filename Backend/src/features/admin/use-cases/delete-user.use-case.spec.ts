import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IAdminUsersRepository } from '../repositories/admin-users.repository.interface';
import { DeleteUserUseCase } from './delete-user.use-case';

describe('DeleteUserUseCase', () => {
    let useCase: DeleteUserUseCase;
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
        useCase = new DeleteUserUseCase(mockRepo);
    });

    it('devrait supprimer un utilisateur existant', async () => {
        mockRepo.findById.mockResolvedValue({
            id: 'user-456',
            nom: 'Martin',
            prenom: 'Sophie',
            email: 'sophie@email.com',
            telephone: '0601020304',
            role: 'client',
            is_actif: true,
            date_creation: new Date(),
        });

        await useCase.execute('admin-123', 'user-456');

        expect(mockRepo.delete).toHaveBeenCalledWith('user-456');
    });

    it('devrait lever ForbiddenException si un admin tente de se supprimer lui-même', async () => {
        await expect(useCase.execute('admin-123', 'admin-123')).rejects.toThrow(
            ForbiddenException,
        );
        // Le repository ne doit jamais être appelé dans ce cas
        expect(mockRepo.findById).not.toHaveBeenCalled();
        expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it("devrait lever NotFoundException si l'utilisateur cible n'existe pas", async () => {
        mockRepo.findById.mockResolvedValue(null);

        await expect(useCase.execute('admin-123', 'ghost-999')).rejects.toThrow(
            NotFoundException,
        );
        expect(mockRepo.delete).not.toHaveBeenCalled();
    });
});
