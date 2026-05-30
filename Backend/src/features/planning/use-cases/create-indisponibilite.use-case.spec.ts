import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { CreateIndisponibiliteUseCase } from './create-indisponibilite.use-case';

const validPayload = {
    technicien_id: 'tech-uuid-1',
    date_debut: '2026-07-14T00:00:00.000Z',
    date_fin: '2026-07-21T00:00:00.000Z',
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

    it('devrait lever BadRequestException si date_fin <= date_debut', async () => {
        const payload = {
            ...validPayload,
            date_debut: '2026-07-21T00:00:00.000Z',
            date_fin: '2026-07-14T00:00:00.000Z',
        };

        await expect(useCase.execute(payload)).rejects.toThrow(
            BadRequestException,
        );

        expect(mockRepo.technicienExists).not.toHaveBeenCalled();
    });

    it('devrait lever BadRequestException si date_fin === date_debut', async () => {
        const payload = { ...validPayload, date_fin: validPayload.date_debut };

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
