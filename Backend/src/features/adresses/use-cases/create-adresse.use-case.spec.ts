import { ConflictException } from '@nestjs/common';
import { CreateAdresseUseCase } from './create-adresse.use-case';
import type { IAdressesRepository } from '../repositories/adresses.repository.interface';
import type { AdresseDto } from '../dto/output/adresse.dto';
import type { CreateAdresseInput } from '../dto/input/adresse-input.dto';

const makeAdresse = (overrides: Partial<AdresseDto> = {}): AdresseDto => ({
    id: 'pss-1',
    adresseId: 'adr-1',
    numero: '12',
    rue: 'Rue de la Paix',
    codePostal: '69001',
    ville: 'Lyon',
    pays: 'France',
    latitude: 45.75,
    longitude: 4.85,
    googlePlaceId: 'ChIJ_gplace1',
    titreDescription: null,
    adressePrincipal: false,
    isValide: true,
    dateCreation: new Date(),
    ...overrides,
});

const makeInput = (
    overrides: Partial<CreateAdresseInput> = {},
): CreateAdresseInput => ({
    numero: '12',
    rue: 'Rue de la Paix',
    codePostal: '69001',
    ville: 'Lyon',
    pays: 'France',
    latitude: 45.75,
    longitude: 4.85,
    googlePlaceId: 'ChIJ_gplace1',
    titreDescription: undefined,
    ...overrides,
});

describe('CreateAdresseUseCase', () => {
    let useCase: CreateAdresseUseCase;
    let mockRepo: jest.Mocked<IAdressesRepository>;

    beforeEach(() => {
        mockRepo = {
            findAllByUser: jest.fn(),
            findByIdAndUser: jest.fn(),
            findAdresseByGooglePlaceId: jest.fn(),
            create: jest.fn(),
            updateMetadata: jest.fn(),
            setPrincipal: jest.fn(),
            unsetPrincipal: jest.fn(),
            softDelete: jest.fn(),
        };
        useCase = new CreateAdresseUseCase(mockRepo);
    });

    it('devrait créer une adresse pour un utilisateur', async () => {
        const input = makeInput();
        const created = makeAdresse();

        mockRepo.findAdresseByGooglePlaceId.mockResolvedValue(null);
        mockRepo.findAllByUser.mockResolvedValue([]);
        mockRepo.create.mockResolvedValue(created);

        const result = await useCase.execute('user-1', input);

        expect(mockRepo.create).toHaveBeenCalledWith('user-1', input);
        expect(result).toEqual(created);
    });

    it('devrait lever une ConflictException si le google_place_id est déjà actif pour cet utilisateur', async () => {
        const input = makeInput();
        const existingAdresse = { id: 'adr-1' };
        const existingLiaison = makeAdresse({
            adresseId: 'adr-1',
            isValide: true,
        });

        mockRepo.findAdresseByGooglePlaceId.mockResolvedValue(existingAdresse);
        mockRepo.findAllByUser.mockResolvedValue([existingLiaison]);

        await expect(useCase.execute('user-1', input)).rejects.toThrow(
            ConflictException,
        );
        expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('devrait appeler setPrincipal si adressePrincipal est true à la création', async () => {
        const input = makeInput({ adressePrincipal: true });
        const created = makeAdresse({ id: 'pss-1' });
        const withPrincipal = makeAdresse({
            id: 'pss-1',
            adressePrincipal: true,
        });

        mockRepo.findAdresseByGooglePlaceId.mockResolvedValue(null);
        mockRepo.create.mockResolvedValue(created);
        mockRepo.setPrincipal.mockResolvedValue(withPrincipal);

        const result = await useCase.execute('user-1', input);

        expect(mockRepo.create).toHaveBeenCalledWith('user-1', input);
        expect(mockRepo.setPrincipal).toHaveBeenCalledWith('pss-1', 'user-1');
        expect(result).toEqual(withPrincipal);
    });

    it("devrait créer la liaison si le google_place_id existe en base mais n'est pas lié à cet utilisateur", async () => {
        const input = makeInput();
        const existingAdresse = { id: 'adr-1' };
        const created = makeAdresse();

        mockRepo.findAdresseByGooglePlaceId.mockResolvedValue(existingAdresse);
        mockRepo.findAllByUser.mockResolvedValue([]); // cet utilisateur n'a pas cette adresse
        mockRepo.create.mockResolvedValue(created);

        const result = await useCase.execute('user-1', input);

        expect(mockRepo.create).toHaveBeenCalledWith('user-1', input);
        expect(result).toEqual(created);
    });
});
