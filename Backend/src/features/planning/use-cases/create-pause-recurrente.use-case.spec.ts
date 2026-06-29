import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { CreatePauseRecurrenteUseCase } from './create-pause-recurrente.use-case';

const validPayload = {
    technicienId: 'tech-uuid-1',
    jourSemaine: null, // tous les jours
    heureDebut: 720, // 12h00
    heureFin: 810, // 13h30
    description: 'Pause déjeuner',
};

const mockPauseDto = { id: 'pause-uuid-1', ...validPayload };

describe('CreatePauseRecurrenteUseCase', () => {
    let useCase: CreatePauseRecurrenteUseCase;
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
        useCase = new CreatePauseRecurrenteUseCase(mockRepo);
    });

    it('devrait créer la pause si le technicien existe et les horaires sont valides', async () => {
        mockRepo.technicienExists.mockResolvedValue(true);
        mockRepo.createPause.mockResolvedValue(mockPauseDto);

        const result = await useCase.execute(validPayload);

        expect(mockRepo.technicienExists).toHaveBeenCalledWith('tech-uuid-1');
        expect(mockRepo.createPause).toHaveBeenCalledWith(validPayload);
        expect(result.id).toBe('pause-uuid-1');
    });

    it('devrait lever BadRequestException si heureFin <= heureDebut', async () => {
        const payload = { ...validPayload, heureDebut: 810, heureFin: 720 };

        await expect(useCase.execute(payload)).rejects.toThrow(
            BadRequestException,
        );

        expect(mockRepo.technicienExists).not.toHaveBeenCalled();
    });

    it('devrait lever NotFoundException si le technicien est introuvable', async () => {
        mockRepo.technicienExists.mockResolvedValue(false);

        await expect(useCase.execute(validPayload)).rejects.toThrow(
            NotFoundException,
        );

        expect(mockRepo.createPause).not.toHaveBeenCalled();
    });
});
