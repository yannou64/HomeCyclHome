import { NotFoundException } from '@nestjs/common';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { DeleteIndisponibiliteUseCase } from './delete-indisponibilite.use-case';

describe('DeleteIndisponibiliteUseCase', () => {
    let useCase: DeleteIndisponibiliteUseCase;
    let mockRepo: jest.Mocked<IPlanningRepository>;

    beforeEach(() => {
        mockRepo = {
            findModelesByTechnicien: jest.fn(),
            findModeleById: jest.fn(),
            findModelesChevauchants: jest.fn(),
            createModele: jest.fn(),
            updateModele: jest.fn(),
            deleteModele: jest.fn(),
            findPausesByTechnicien: jest.fn(),
            findPauseById: jest.fn(),
            createPause: jest.fn(),
            deletePause: jest.fn(),
            findIndisponibilitesByTechnicien: jest.fn(),
            findIndisponibiliteById: jest.fn(),
            createIndisponibilite: jest.fn(),
            deleteIndisponibilite: jest.fn(),
            technicienExists: jest.fn(),
            isAffecteAZone: jest.fn(),
        };
        useCase = new DeleteIndisponibiliteUseCase(mockRepo);
    });

    it("devrait supprimer l'indisponibilité si elle existe", async () => {
        const indispo = { id: 'indispo-1', technicien_id: 'tech-1', date_debut: '2026-07-14T00:00:00.000Z', date_fin: '2026-07-21T00:00:00.000Z', motif: null };
        mockRepo.findIndisponibiliteById.mockResolvedValue(indispo);
        mockRepo.deleteIndisponibilite.mockResolvedValue(undefined);

        await useCase.execute('indispo-1');

        expect(mockRepo.findIndisponibiliteById).toHaveBeenCalledWith('indispo-1');
        expect(mockRepo.deleteIndisponibilite).toHaveBeenCalledWith('indispo-1');
    });

    it("devrait lever NotFoundException si l'indisponibilité est introuvable", async () => {
        mockRepo.findIndisponibiliteById.mockResolvedValue(null);

        await expect(useCase.execute('inconnu')).rejects.toThrow(NotFoundException);

        expect(mockRepo.deleteIndisponibilite).not.toHaveBeenCalled();
    });
});