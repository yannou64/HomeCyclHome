import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { CreateModelePlanificationUseCase } from './create-modele-planification.use-case';

const validPayload = {
    technicienId: 'tech-uuid-1',
    zoneId: 'zone-uuid-1',
    jourSemaine: 1, // mardi
    heureDebut: 480, // 8h00
    heureFin: 1020, // 17h00
    intervalleMinutes: 60,
    isActif: true,
    dateDebutValidite: '2026-06-01T00:00:00.000Z',
};

const mockModeleDto = {
    id: 'modele-uuid-1',
    ...validPayload,
    dateFinValidite: null,
};

describe('CreateModelePlanificationUseCase', () => {
    let useCase: CreateModelePlanificationUseCase;
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
        useCase = new CreateModelePlanificationUseCase(mockRepo);
    });

    it('devrait créer le modèle si toutes les règles métier sont respectées', async () => {
        mockRepo.technicienExists.mockResolvedValue(true);
        mockRepo.isAffecteAZone.mockResolvedValue(true);
        mockRepo.findModelesChevauchants.mockResolvedValue([]);
        mockRepo.createModele.mockResolvedValue(mockModeleDto);

        const result = await useCase.execute(validPayload);

        expect(mockRepo.technicienExists).toHaveBeenCalledWith('tech-uuid-1');
        expect(mockRepo.isAffecteAZone).toHaveBeenCalledWith(
            'tech-uuid-1',
            'zone-uuid-1',
        );
        expect(mockRepo.findModelesChevauchants).toHaveBeenCalled();
        expect(mockRepo.createModele).toHaveBeenCalled();
        expect(result.id).toBe('modele-uuid-1');
    });

    it('devrait lever BadRequestException si heureFin <= heureDebut', async () => {
        const payload = { ...validPayload, heureDebut: 720, heureFin: 480 };

        await expect(useCase.execute(payload)).rejects.toThrow(
            BadRequestException,
        );

        // Aucun appel au repo — validation bloquante en premier
        expect(mockRepo.technicienExists).not.toHaveBeenCalled();
        expect(mockRepo.createModele).not.toHaveBeenCalled();
    });

    it('devrait lever BadRequestException si heureFin === heureDebut', async () => {
        const payload = { ...validPayload, heureDebut: 480, heureFin: 480 };

        await expect(useCase.execute(payload)).rejects.toThrow(
            BadRequestException,
        );
    });

    it('devrait lever NotFoundException si le technicien est introuvable', async () => {
        mockRepo.technicienExists.mockResolvedValue(false);

        await expect(useCase.execute(validPayload)).rejects.toThrow(
            NotFoundException,
        );

        expect(mockRepo.isAffecteAZone).not.toHaveBeenCalled();
        expect(mockRepo.createModele).not.toHaveBeenCalled();
    });

    it("devrait lever BadRequestException si le technicien n'est pas affecté à la zone", async () => {
        mockRepo.technicienExists.mockResolvedValue(true);
        mockRepo.isAffecteAZone.mockResolvedValue(false);

        await expect(useCase.execute(validPayload)).rejects.toThrow(
            BadRequestException,
        );

        expect(mockRepo.findModelesChevauchants).not.toHaveBeenCalled();
        expect(mockRepo.createModele).not.toHaveBeenCalled();
    });

    it('devrait lever ConflictException en cas de chevauchement avec un modèle existant', async () => {
        mockRepo.technicienExists.mockResolvedValue(true);
        mockRepo.isAffecteAZone.mockResolvedValue(true);
        // Le repo signale un conflit
        mockRepo.findModelesChevauchants.mockResolvedValue([mockModeleDto]);

        await expect(useCase.execute(validPayload)).rejects.toThrow(
            ConflictException,
        );

        expect(mockRepo.createModele).not.toHaveBeenCalled();
    });
});
