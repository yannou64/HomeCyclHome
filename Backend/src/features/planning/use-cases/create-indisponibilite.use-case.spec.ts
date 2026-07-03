import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { CreateIndisponibiliteUseCase } from './create-indisponibilite.use-case';

const validPayload = {
    technicienId: 'tech-uuid-1',
    dateDebut: '2026-07-14T00:00:00.000Z',
    dateFin: '2026-07-21T00:00:00.000Z',
    motif: 'Congés annuels',
};

const mockIndispoDto = { id: 'indispo-uuid-1', ...validPayload };

describe('CreateIndisponibiliteUseCase', () => {
    let useCase: CreateIndisponibiliteUseCase;
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
        useCase = new CreateIndisponibiliteUseCase(mockRepo);
    });

    it("devrait créer l'indisponibilité si le technicien existe et les dates sont valides", async () => {
        mockRepo.technicienExists.mockResolvedValue(true);
        mockRepo.createIndisponibilite.mockResolvedValue(mockIndispoDto);

        const result = await useCase.execute(validPayload);

        expect(mockRepo.technicienExists).toHaveBeenCalledWith('tech-uuid-1');
        expect(mockRepo.createIndisponibilite).toHaveBeenCalled();
        expect(result.id).toBe('indispo-uuid-1');
    });

    it('devrait lever BadRequestException si dateFin <= dateDebut', async () => {
        const payload = {
            ...validPayload,
            dateDebut: '2026-07-21T00:00:00.000Z',
            dateFin: '2026-07-14T00:00:00.000Z',
        };

        await expect(useCase.execute(payload)).rejects.toThrow(
            BadRequestException,
        );

        expect(mockRepo.technicienExists).not.toHaveBeenCalled();
    });

    it('devrait lever BadRequestException si dateFin === dateDebut', async () => {
        const payload = { ...validPayload, dateFin: validPayload.dateDebut };

        await expect(useCase.execute(payload)).rejects.toThrow(
            BadRequestException,
        );
    });

    it('devrait lever NotFoundException si le technicien est introuvable', async () => {
        mockRepo.technicienExists.mockResolvedValue(false);

        await expect(useCase.execute(validPayload)).rejects.toThrow(
            NotFoundException,
        );

        expect(mockRepo.createIndisponibilite).not.toHaveBeenCalled();
    });
});
