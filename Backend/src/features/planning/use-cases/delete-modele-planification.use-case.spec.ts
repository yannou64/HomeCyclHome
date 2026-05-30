import { NotFoundException } from '@nestjs/common';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { DeleteModelePlanificationUseCase } from './delete-modele-planification.use-case';

const mockModele = {
    id: 'modele-uuid-1',
    technicien_id: 'tech-uuid-1',
    zone_id: 'zone-uuid-1',
    jour_semaine: 1,
    heure_debut: 480,
    heure_fin: 1020,
    intervalle_minutes: 60,
    is_actif: true,
    date_debut_validite: '2026-06-01T00:00:00.000Z',
    date_fin_validite: null,
};

describe('DeleteModelePlanificationUseCase', () => {
    let useCase: DeleteModelePlanificationUseCase;
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
        useCase = new DeleteModelePlanificationUseCase(mockRepo);
    });

    it('devrait supprimer le modèle si il existe', async () => {
        mockRepo.findModeleById.mockResolvedValue(mockModele);
        mockRepo.deleteModele.mockResolvedValue(undefined);

        await useCase.execute('modele-uuid-1');

        expect(mockRepo.findModeleById).toHaveBeenCalledWith('modele-uuid-1');
        expect(mockRepo.deleteModele).toHaveBeenCalledWith('modele-uuid-1');
    });

    it('devrait lever NotFoundException si le modèle est introuvable', async () => {
        mockRepo.findModeleById.mockResolvedValue(null);

        await expect(useCase.execute('inconnu-uuid')).rejects.toThrow(
            NotFoundException,
        );

        expect(mockRepo.deleteModele).not.toHaveBeenCalled();
    });
});
