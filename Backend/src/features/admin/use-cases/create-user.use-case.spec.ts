import { ConflictException } from '@nestjs/common';
import { IAdminUsersRepository } from '../repositories/admin-users.repository.interface';
import { CreateUserUseCase } from './create-user.use-case';

const validPayload = {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@email.com',
    telephone: '0601020304',
    role: 'technicien' as const,
    password: 'MotDePasse123!',
};

describe('CreateUserUseCase', () => {
    let useCase: CreateUserUseCase;
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
        useCase = new CreateUserUseCase(mockRepo);
    });

    it('devrait créer un utilisateur si l\'email est disponible', async () => {
        mockRepo.findByEmail.mockResolvedValue(null); // email libre
        mockRepo.create.mockResolvedValue({
            id: 'new-uuid',
            ...validPayload,
            is_actif: true,
            date_creation: new Date(),
        });

        const result = await useCase.execute(validPayload);

        expect(mockRepo.findByEmail).toHaveBeenCalledWith(validPayload.email);
        expect(mockRepo.create).toHaveBeenCalledWith(validPayload);
        expect(result.id).toBe('new-uuid');
    });

    it('devrait lever ConflictException si l\'email est déjà utilisé', async () => {
        mockRepo.findByEmail.mockResolvedValue({
            id: 'existing-uuid',
            ...validPayload,
            is_actif: true,
            date_creation: new Date(),
        });

        await expect(useCase.execute(validPayload)).rejects.toThrow(
            ConflictException,
        );
        // Le repository ne doit jamais créer si l'email existe déjà
        expect(mockRepo.create).not.toHaveBeenCalled();
    });
});
