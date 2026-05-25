import { NotFoundException } from '@nestjs/common';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { DeletePauseRecurrenteUseCase } from './delete-pause-recurrente.use-case';

describe('DeletePauseRecurrenteUseCase', () => {
    let useCase: DeletePauseRecurrenteUseCase;
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
        useCase = new DeletePauseRecurrenteUseCase(mockRepo);
    });

    it('devrait supprimer la pause si elle existe', async () => {
        const pause = { id: 'pause-1', technicien_id: 'tech-1', jour_semaine: null, heure_debut: 720, heure_fin: 810, description: null };
        mockRepo.findPauseById.mockResolvedValue(pause);
        mockRepo.deletePause.mockResolvedValue(undefined);

        await useCase.execute('pause-1');

        expect(mockRepo.findPauseById).toHaveBeenCalledWith('pause-1');
        expect(mockRepo.deletePause).toHaveBeenCalledWith('pause-1');
    });

    it('devrait lever NotFoundException si la pause est introuvable', async () => {
        mockRepo.findPauseById.mockResolvedValue(null);

        await expect(useCase.execute('inconnu')).rejects.toThrow(NotFoundException);

        expect(mockRepo.deletePause).not.toHaveBeenCalled();
    });
});