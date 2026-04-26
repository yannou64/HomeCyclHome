import { AdminUserDto } from '../dto/admin-user.dto';
import { IAdminUsersRepository } from '../repositories/admin-users.repository.interface';
import { GetUsersUseCase } from './get-users.use-case';

// Fabrique un utilisateur fictif pour les tests
const makeUser = (override: Partial<AdminUserDto> = {}): AdminUserDto => ({
    id: 'uuid-1',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@email.com',
    telephone: '0601020304',
    role: 'technicien',
    is_actif: true,
    date_creation: new Date('2025-01-01'),
    ...override,
});

describe('GetUsersUseCase', () => {
    let useCase: GetUsersUseCase;
    let mockRepo: jest.Mocked<IAdminUsersRepository>;

    beforeEach(() => {
        // On crée un mock de toutes les méthodes de l'interface
        mockRepo = {
            findMany: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        useCase = new GetUsersUseCase(mockRepo);
    });

    it('devrait retourner les utilisateurs avec les métadonnées de pagination', async () => {
        const users = [makeUser(), makeUser({ id: 'uuid-2' })];
        mockRepo.findMany.mockResolvedValue({ users, total: 2 });

        const result = await useCase.execute({ page: 1, limit: 10 });

        expect(result.data).toEqual(users);
        expect(result.meta).toEqual({ total: 2, page: 1, limit: 10, totalPages: 1 });
    });

    it('devrait calculer correctement totalPages (24 résultats / 10 par page = 3)', async () => {
        mockRepo.findMany.mockResolvedValue({ users: [], total: 24 });

        const result = await useCase.execute({ page: 1, limit: 10 });

        expect(result.meta.totalPages).toBe(3);
    });

    it('devrait arrondir totalPages au supérieur (21 résultats / 10 = 3 pages)', async () => {
        mockRepo.findMany.mockResolvedValue({ users: [], total: 21 });

        const result = await useCase.execute({ page: 1, limit: 10 });

        expect(result.meta.totalPages).toBe(3);
    });

    it('devrait transmettre les filtres au repository sans les modifier', async () => {
        mockRepo.findMany.mockResolvedValue({ users: [], total: 0 });

        await useCase.execute({
            page: 2,
            limit: 5,
            search: 'jean',
            role: 'technicien',
            is_actif: true,
        });

        expect(mockRepo.findMany).toHaveBeenCalledWith({
            page: 2,
            limit: 5,
            search: 'jean',
            role: 'technicien',
            is_actif: true,
        });
    });
});
