import { NotFoundException } from '@nestjs/common';
import { IAffectationsRepository } from '../repositories/affectations.repository.interface';
import { GetAffectationByTechnicienUseCase } from './get-affectation-by-technicien.use-case';

const mockAffectation = {
    technicien_id: 'tech-uuid-1',
    nom: 'Dupont',
    prenom: 'Marie',
    email: 'marie.dupont@example.com',
    zones: [{ id: 'zone-uuid-1', nom_zone: 'Lyon Centre', is_active: true }],
};

describe('GetAffectationByTechnicienUseCase', () => {
    let useCase: GetAffectationByTechnicienUseCase;
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
        useCase = new GetAffectationByTechnicienUseCase(mockRepo);
    });

    it("devrait retourner l'affectation du technicien si elle existe", async () => {
        mockRepo.findByTechnicienId.mockResolvedValue(mockAffectation);

        const result = await useCase.execute('tech-uuid-1');

        expect(mockRepo.findByTechnicienId).toHaveBeenCalledWith('tech-uuid-1');
        expect(result.technicien_id).toBe('tech-uuid-1');
        expect(result.zones).toHaveLength(1);
    });

    it('devrait lever NotFoundException si le technicien est introuvable', async () => {
        mockRepo.findByTechnicienId.mockResolvedValue(null);

        await expect(useCase.execute('inconnu-uuid')).rejects.toThrow(
            NotFoundException,
        );
        expect(mockRepo.findByTechnicienId).toHaveBeenCalledWith(
            'inconnu-uuid',
        );
    });
});
