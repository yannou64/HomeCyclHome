import { NotFoundException } from '@nestjs/common';
import { IAffectationsRepository } from '../repositories/affectations.repository.interface';
import { DeleteTechnicienAffectationsUseCase } from './delete-technicien-affectations.use-case';

const TECH_ID = 'tech-uuid-1';

describe('DeleteTechnicienAffectationsUseCase', () => {
    let useCase: DeleteTechnicienAffectationsUseCase;
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
        useCase = new DeleteTechnicienAffectationsUseCase(mockRepo);
    });

    it('devrait supprimer les affectations si le technicien existe', async () => {
        mockRepo.technicienExists.mockResolvedValue(true);
        mockRepo.deleteForTechnicien.mockResolvedValue(undefined);

        await useCase.execute(TECH_ID);

        expect(mockRepo.technicienExists).toHaveBeenCalledWith(TECH_ID);
        expect(mockRepo.deleteForTechnicien).toHaveBeenCalledWith(TECH_ID);
    });

    it('devrait lever NotFoundException si le technicien est introuvable', async () => {
        mockRepo.technicienExists.mockResolvedValue(false);

        await expect(useCase.execute(TECH_ID)).rejects.toThrow(
            NotFoundException,
        );
        expect(mockRepo.deleteForTechnicien).not.toHaveBeenCalled();
    });
});
