import {
    BadRequestException,
    ConflictException,
    UnprocessableEntityException,
} from '@nestjs/common';
import {
    CreateInterventionUseCase,
    type CreateInterventionInput,
} from './create-intervention.use-case';
import type { IInterventionsRepository } from '../repositories/interventions.repository.interface';
import type { InterventionCreatedDto } from '../dto/output/intervention-created.dto';

// ─── Factories ────────────────────────────────────────────────────────────────

const makeInput = (
    overrides: Partial<CreateInterventionInput> = {},
): CreateInterventionInput => ({
    adresse: { source: 'saved', adresseId: 'adr-1' },
    cycle: { source: 'existing', cycleId: 'cyc-1' },
    forfaitId: 'for-1',
    creneauId: 'cre-1',
    ...overrides,
});

const makeInterventionCreated = (
    overrides: Partial<InterventionCreatedDto> = {},
): InterventionCreatedDto => ({
    id: 'int-1',
    statut: 'Planifiee',
    dateCreation: new Date().toISOString(),
    ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateInterventionUseCase', () => {
    let useCase: CreateInterventionUseCase;
    let mockRepo: jest.Mocked<IInterventionsRepository>;

    beforeEach(() => {
        mockRepo = {
            isCreneauDisponible: jest.fn(),
            createCycle: jest.fn(),
            upsertAdresse: jest.fn(),
            getPrixActuelForfait: jest.fn(),
            getTechnicienFromCreneau: jest.fn(),
            getForfaitDuree: jest.fn(),
            createInterventionTransaction: jest.fn(),
        };
        useCase = new CreateInterventionUseCase(mockRepo);
    });

    // ── Cas nominal ──────────────────────────────────────────────────────────

    it('devrait créer une intervention avec un cycle existant et une adresse sauvegardée', async () => {
        const input = makeInput();
        const created = makeInterventionCreated();

        mockRepo.isCreneauDisponible.mockResolvedValue(true);
        mockRepo.getPrixActuelForfait.mockResolvedValue({ id: 'prix-1', montant: 49.9 });
        mockRepo.getTechnicienFromCreneau.mockResolvedValue('tech-1');
        mockRepo.getForfaitDuree.mockResolvedValue(60);
        mockRepo.createInterventionTransaction.mockResolvedValue(created);

        const result = await useCase.execute('user-1', input);

        expect(mockRepo.createInterventionTransaction).toHaveBeenCalledWith(
            expect.objectContaining({
                clientId: 'user-1',
                cycleId: 'cyc-1',
                adresseId: 'adr-1',
                forfaitId: 'for-1',
                creneauId: 'cre-1',
                historiquePrixForfaitId: 'prix-1',
                dureeMinutesSnapshot: 60,
                technicienId: 'tech-1',
            }),
        );
        expect(result).toEqual(created);
    });

    // ── Créneau indisponible ─────────────────────────────────────────────────

    it('devrait lever ConflictException si le créneau est indisponible', async () => {
        const input = makeInput();

        mockRepo.isCreneauDisponible.mockResolvedValue(false);

        await expect(useCase.execute('user-1', input)).rejects.toThrow(
            ConflictException,
        );
        // Aucune transaction ne doit être tentée
        expect(mockRepo.createInterventionTransaction).not.toHaveBeenCalled();
    });

    // ── Cycle nouveau ────────────────────────────────────────────────────────

    it('devrait créer un cycle si source === "new" et utiliser son id dans la transaction', async () => {
        const input = makeInput({
            cycle: { source: 'new', typeCycleId: 'type-1', marqueId: 'marq-1' },
        });
        const created = makeInterventionCreated();

        mockRepo.isCreneauDisponible.mockResolvedValue(true);
        mockRepo.createCycle.mockResolvedValue('cyc-new');
        mockRepo.getPrixActuelForfait.mockResolvedValue({ id: 'prix-1', montant: 49.9 });
        mockRepo.getTechnicienFromCreneau.mockResolvedValue('tech-1');
        mockRepo.getForfaitDuree.mockResolvedValue(60);
        mockRepo.createInterventionTransaction.mockResolvedValue(created);

        await useCase.execute('user-1', input);

        expect(mockRepo.createCycle).toHaveBeenCalledWith('user-1', {
            typeCycleId: 'type-1',
            marqueId: 'marq-1',
        });
        expect(mockRepo.createInterventionTransaction).toHaveBeenCalledWith(
            expect.objectContaining({ cycleId: 'cyc-new' }),
        );
    });

    it('devrait lever BadRequestException si cycle source === "new" sans typeCycleId', async () => {
        const input = makeInput({
            cycle: { source: 'new', marqueId: 'marq-1' },
        });

        mockRepo.isCreneauDisponible.mockResolvedValue(true);

        await expect(useCase.execute('user-1', input)).rejects.toThrow(
            BadRequestException,
        );
        expect(mockRepo.createCycle).not.toHaveBeenCalled();
    });

    // ── Adresse autocomplete ─────────────────────────────────────────────────

    it('devrait faire un upsert d\'adresse si source === "autocomplete"', async () => {
        const input = makeInput({
            adresse: {
                source: 'autocomplete',
                rue: 'Rue de la République',
                codePostal: '69002',
                ville: 'Lyon',
                latitude: 45.75,
                longitude: 4.83,
                googlePlaceId: 'ChIJ_gplace42',
            },
        });
        const created = makeInterventionCreated();

        mockRepo.isCreneauDisponible.mockResolvedValue(true);
        mockRepo.upsertAdresse.mockResolvedValue('adr-new');
        mockRepo.getPrixActuelForfait.mockResolvedValue({ id: 'prix-1', montant: 49.9 });
        mockRepo.getTechnicienFromCreneau.mockResolvedValue('tech-1');
        mockRepo.getForfaitDuree.mockResolvedValue(60);
        mockRepo.createInterventionTransaction.mockResolvedValue(created);

        await useCase.execute('user-1', input);

        expect(mockRepo.upsertAdresse).toHaveBeenCalledWith(
            expect.objectContaining({ googlePlaceId: 'ChIJ_gplace42' }),
        );
        expect(mockRepo.createInterventionTransaction).toHaveBeenCalledWith(
            expect.objectContaining({ adresseId: 'adr-new' }),
        );
    });

    it('devrait lever BadRequestException si adresse source === "saved" sans adresseId', async () => {
        const input = makeInput({
            adresse: { source: 'saved' },
        });

        mockRepo.isCreneauDisponible.mockResolvedValue(true);

        await expect(useCase.execute('user-1', input)).rejects.toThrow(
            BadRequestException,
        );
        expect(mockRepo.createInterventionTransaction).not.toHaveBeenCalled();
    });

    // ── Prix forfait ─────────────────────────────────────────────────────────

    it('devrait lever UnprocessableEntityException si le forfait n\'a pas de prix actif', async () => {
        const input = makeInput();

        mockRepo.isCreneauDisponible.mockResolvedValue(true);
        mockRepo.getPrixActuelForfait.mockResolvedValue(null);

        await expect(useCase.execute('user-1', input)).rejects.toThrow(
            UnprocessableEntityException,
        );
        expect(mockRepo.createInterventionTransaction).not.toHaveBeenCalled();
    });

    // ── Technicien nullable ──────────────────────────────────────────────────

    it('devrait passer technicienId à null si le créneau n\'a pas de modèle de planification', async () => {
        const input = makeInput();
        const created = makeInterventionCreated();

        mockRepo.isCreneauDisponible.mockResolvedValue(true);
        mockRepo.getTechnicienFromCreneau.mockResolvedValue(null); // créneau manuel
        mockRepo.getPrixActuelForfait.mockResolvedValue({ id: 'prix-1', montant: 49.9 });
        mockRepo.getForfaitDuree.mockResolvedValue(60);
        mockRepo.createInterventionTransaction.mockResolvedValue(created);

        await useCase.execute('user-1', input);

        expect(mockRepo.createInterventionTransaction).toHaveBeenCalledWith(
            expect.objectContaining({ technicienId: null }),
        );
    });
});
