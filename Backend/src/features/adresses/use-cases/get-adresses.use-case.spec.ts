import { GetAdressesUseCase } from './get-adresses.use-case';
import type { IAdressesRepository } from '../repositories/adresses.repository.interface';
import type { AdresseDto } from '../dto/output/adresse.dto';

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
    titreDescription: 'Domicile',
    adressePrincipal: false,
    isValide: true,
    dateCreation: new Date(),
    ...overrides,
});

describe('GetAdressesUseCase', () => {
    let useCase: GetAdressesUseCase;
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
        useCase = new GetAdressesUseCase(mockRepo);
    });

    it("devrait retourner les adresses actives de l'utilisateur", async () => {
        const adresses = [makeAdresse(), makeAdresse({ id: 'pss-2', adresseId: 'adr-2' })];
        mockRepo.findAllByUser.mockResolvedValue(adresses);

        const result = await useCase.execute('user-1');

        expect(mockRepo.findAllByUser).toHaveBeenCalledWith('user-1');
        expect(result).toEqual(adresses);
    });

    it("devrait retourner un tableau vide si l'utilisateur n'a aucune adresse", async () => {
        mockRepo.findAllByUser.mockResolvedValue([]);

        const result = await useCase.execute('user-1');

        expect(result).toEqual([]);
    });
});
