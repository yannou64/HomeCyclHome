import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IAffectationsRepository } from '../repositories/affectations.repository.interface';
import { SetTechnicienZonesUseCase } from './set-technicien-zones.use-case';

const TECH_ID = 'tech-uuid-1';
const ZONE_IDS = ['zone-uuid-1', 'zone-uuid-2'];

const mockAffectation = {
    technicien_id: TECH_ID,
    nom: 'Dupont',
    prenom: 'Marie',
    email: 'marie.dupont@example.com',
    zones: [
        { id: 'zone-uuid-1', nom_zone: 'Lyon Centre', is_active: true },
        { id: 'zone-uuid-2', nom_zone: 'Lyon Nord', is_active: true },
    ],
};

describe('SetTechnicienZonesUseCase', () => {
    let useCase: SetTechnicienZonesUseCase;
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
        useCase = new SetTechnicienZonesUseCase(mockRepo);
    });

    it('devrait affecter les zones au technicien si tout est valide', async () => {
        mockRepo.technicienExists.mockResolvedValue(true);
        mockRepo.zonesExist.mockResolvedValue(true);
        mockRepo.setZonesForTechnicien.mockResolvedValue(mockAffectation);

        const result = await useCase.execute(TECH_ID, ZONE_IDS);

        expect(mockRepo.technicienExists).toHaveBeenCalledWith(TECH_ID);
        expect(mockRepo.zonesExist).toHaveBeenCalledWith(ZONE_IDS);
        expect(mockRepo.setZonesForTechnicien).toHaveBeenCalledWith(
            TECH_ID,
            ZONE_IDS,
        );
        expect(result.zones).toHaveLength(2);
    });

    it("devrait lever NotFoundException si le technicien est introuvable ou n'a pas le bon rôle", async () => {
        mockRepo.technicienExists.mockResolvedValue(false);

        await expect(useCase.execute(TECH_ID, ZONE_IDS)).rejects.toThrow(
            NotFoundException,
        );
        expect(mockRepo.setZonesForTechnicien).not.toHaveBeenCalled();
    });

    it("devrait lever NotFoundException si une ou plusieurs zones n'existent pas", async () => {
        mockRepo.technicienExists.mockResolvedValue(true);
        mockRepo.zonesExist.mockResolvedValue(false);

        await expect(useCase.execute(TECH_ID, ZONE_IDS)).rejects.toThrow(
            NotFoundException,
        );
        expect(mockRepo.setZonesForTechnicien).not.toHaveBeenCalled();
    });

    it('devrait lever BadRequestException si zone_ids est vide', async () => {
        await expect(useCase.execute(TECH_ID, [])).rejects.toThrow(
            BadRequestException,
        );
        expect(mockRepo.technicienExists).not.toHaveBeenCalled();
    });
});
