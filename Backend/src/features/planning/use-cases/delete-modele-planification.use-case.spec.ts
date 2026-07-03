import { NotFoundException } from '@nestjs/common';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { DeleteModelePlanificationUseCase } from './delete-modele-planification.use-case';

const mockModele = {
    id: 'modele-uuid-1',
    technicienId: 'tech-uuid-1',
    zoneId: 'zone-uuid-1',
    jourSemaine: 1,
    heureDebut: 480,
    heureFin: 1020,
    intervalleMinutes: 60,
    isActif: true,
    dateDebutValidite: '2026-06-01T00:00:00.000Z',
    dateFinValidite: null,
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
            findCreneauxDateDebutByModele: jest.fn(),
            countCreneauxConflits: jest.fn(),
            createManyCreneaux: jest.fn(),
            findCreneauxByTechnicien: jest.fn(),
            findCreneauById: jest.fn(),
            findCreneauxByZone: jest.fn(),
            deleteCreneau: jest.fn(),
            deleteCreneauxDisponibles: jest.fn(),
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
