import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreneauDto } from '../dto/planning.dto';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { DeleteCreneauUseCase } from './delete-creneau.use-case';

const mockCreneauDisponible: CreneauDto = {
    id: 'creneau-uuid-1',
    date_debut: '2026-06-01T09:00:00.000Z',
    date_fin: null,
    is_disponible: true,
    zone_id: 'zone-uuid',
    modele_planification_id: 'modele-uuid',
};

const mockCreneauReserve: CreneauDto = {
    ...mockCreneauDisponible,
    is_disponible: false,
};

function buildMockRepo(
    overrides: Partial<jest.Mocked<IPlanningRepository>> = {},
): jest.Mocked<IPlanningRepository> {
    return {
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
        findCreneauById: jest.fn().mockResolvedValue(mockCreneauDisponible),
        findCreneauxByZone: jest.fn(),
        deleteCreneau: jest.fn().mockResolvedValue(undefined),
        deleteCreneauxDisponibles: jest.fn(),
        ...overrides,
    };
}

describe('DeleteCreneauUseCase', () => {
    let useCase: DeleteCreneauUseCase;
    let mockRepo: jest.Mocked<IPlanningRepository>;

    beforeEach(() => {
        mockRepo = buildMockRepo();
        useCase = new DeleteCreneauUseCase(mockRepo);
    });

    it('devrait supprimer un créneau disponible', async () => {
        await useCase.execute('creneau-uuid-1');

        expect(mockRepo.findCreneauById).toHaveBeenCalledWith('creneau-uuid-1');
        expect(mockRepo.deleteCreneau).toHaveBeenCalledWith('creneau-uuid-1');
    });

    it('devrait lever NotFoundException si le créneau est introuvable', async () => {
        mockRepo.findCreneauById.mockResolvedValue(null);

        await expect(useCase.execute('inexistant')).rejects.toThrow(
            NotFoundException,
        );
        expect(mockRepo.deleteCreneau).not.toHaveBeenCalled();
    });

    it('devrait lever ConflictException si le créneau est réservé (is_disponible=false)', async () => {
        mockRepo.findCreneauById.mockResolvedValue(mockCreneauReserve);

        await expect(useCase.execute('creneau-uuid-1')).rejects.toThrow(
            ConflictException,
        );
        // Le créneau réservé ne doit JAMAIS être supprimé
        expect(mockRepo.deleteCreneau).not.toHaveBeenCalled();
    });
});
