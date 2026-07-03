import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { UpdateModelePlanificationUseCase } from './update-modele-planification.use-case';

const existingModele = {
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

describe('UpdateModelePlanificationUseCase', () => {
    let useCase: UpdateModelePlanificationUseCase;
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
        useCase = new UpdateModelePlanificationUseCase(mockRepo);
    });

    it('devrait mettre à jour le modèle si aucun conflit', async () => {
        mockRepo.findModeleById.mockResolvedValue(existingModele);
        mockRepo.findModelesChevauchants.mockResolvedValue([]);
        mockRepo.updateModele.mockResolvedValue({
            ...existingModele,
            intervalleMinutes: 90,
        });

        const result = await useCase.execute('modele-uuid-1', {
            intervalleMinutes: 90,
        });

        expect(mockRepo.findModeleById).toHaveBeenCalledWith('modele-uuid-1');
        expect(mockRepo.updateModele).toHaveBeenCalledWith('modele-uuid-1', {
            intervalleMinutes: 90,
        });
        expect(result.intervalleMinutes).toBe(90);
    });

    it('devrait lever NotFoundException si le modèle est introuvable', async () => {
        mockRepo.findModeleById.mockResolvedValue(null);

        await expect(useCase.execute('inconnu-uuid', {})).rejects.toThrow(
            NotFoundException,
        );

        expect(mockRepo.updateModele).not.toHaveBeenCalled();
    });

    it('devrait lever BadRequestException si heureFin <= heureDebut après fusion', async () => {
        mockRepo.findModeleById.mockResolvedValue(existingModele);

        // On modifie heureFin pour qu'elle soit inférieure à heureDebut existant
        await expect(
            useCase.execute('modele-uuid-1', { heureFin: 300 }),
        ).rejects.toThrow(BadRequestException);

        expect(mockRepo.updateModele).not.toHaveBeenCalled();
    });

    it('devrait lever ConflictException en cas de chevauchement (en excluant le modèle lui-même)', async () => {
        mockRepo.findModeleById.mockResolvedValue(existingModele);
        // Le repo retourne un conflit avec un AUTRE modèle
        mockRepo.findModelesChevauchants.mockResolvedValue([
            { ...existingModele, id: 'autre-modele-uuid' },
        ]);

        await expect(
            useCase.execute('modele-uuid-1', { heureDebut: 400 }),
        ).rejects.toThrow(ConflictException);

        // Vérifie que le use case passe bien l'excludeId pour exclure le modèle lui-même
        expect(mockRepo.findModelesChevauchants).toHaveBeenCalledWith(
            'tech-uuid-1', // technicienId
            1, // jourSemaine (inchangé)
            400, // heureDebut (du dto)
            1020, // heureFin (de existant)
            expect.any(Date), // dateDebutValidite
            null, // dateFinValidite — null car indéfinie dans existant
            'modele-uuid-1', // excludeId : clé de la règle à tester
        );
    });
});
