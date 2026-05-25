import { IAffectationsRepository } from '../repositories/affectations.repository.interface';
import { GetAffectationsUseCase } from './get-affectations.use-case';

const mockAffectation = {
    technicien_id: 'tech-uuid-1',
    nom: 'Dupont',
    prenom: 'Marie',
    email: 'marie.dupont@example.com',
    zones: [{ id: 'zone-uuid-1', nom_zone: 'Lyon Centre', is_active: true }],
};

describe('GetAffectationsUseCase', () => {
    let useCase: GetAffectationsUseCase;
    let mockRepo: jest.Mocked<IAffectationsRepository>;

    beforeEach(() => {
        mockRepo = {
            findAll: jest.fn(),
            findByTechnicienId: jest.fn(),
            technicienExists: jest.fn(),
            zonesExist: jest.fn(),
            setZonesForTechnicien: jest.fn(),
            deleteForTechnicien: jest.fn(),
        };
        useCase = new GetAffectationsUseCase(mockRepo);
    });

    it('devrait retourner la liste des affectations', async () => {
        mockRepo.findAll.mockResolvedValue([mockAffectation]);

        const result = await useCase.execute();

        expect(mockRepo.findAll).toHaveBeenCalled();
        expect(result).toHaveLength(1);
        expect(result[0].technicien_id).toBe('tech-uuid-1');
    });

    it('devrait retourner un tableau vide si aucune affectation', async () => {
        mockRepo.findAll.mockResolvedValue([]);

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });
});
