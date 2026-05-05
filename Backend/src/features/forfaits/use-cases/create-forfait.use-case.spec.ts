import { ConflictException } from '@nestjs/common';
import { IForfaitsRepository } from '../repositories/forfaits.repository.interface';
import { CreateForfaitUseCase } from './create-forfait.use-case';

const validPayload = {
    nom: 'Révision Express',
    description: 'Contrôle rapide des points de sécurité',
    duree_minutes: 45,
};

describe('CreateForfaitUseCase', () => {
    let useCase: CreateForfaitUseCase;
    let mockRepo: jest.Mocked<IForfaitsRepository>;

    beforeEach(() => {
        mockRepo = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByNom: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            setPrix: jest.fn(),
        };
        useCase = new CreateForfaitUseCase(mockRepo);
    });

    it('devrait créer un forfait si le nom est disponible', async () => {
        mockRepo.findByNom.mockResolvedValue(null);
        mockRepo.create.mockResolvedValue({
            id: 'new-uuid',
            ...validPayload,
            is_actif: true,
            prix_actif: null,
        });

        const result = await useCase.execute(validPayload);

        expect(mockRepo.findByNom).toHaveBeenCalledWith(validPayload.nom);
        expect(mockRepo.create).toHaveBeenCalledWith(validPayload);
        expect(result.id).toBe('new-uuid');
    });

    it('devrait lever ConflictException si le nom est déjà utilisé', async () => {
        mockRepo.findByNom.mockResolvedValue({
            id: 'existing-uuid',
            ...validPayload,
            is_actif: true,
            prix_actif: null,
        });

        await expect(useCase.execute(validPayload)).rejects.toThrow(
            ConflictException,
        );
        expect(mockRepo.create).not.toHaveBeenCalled();
    });
});