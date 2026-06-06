import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeleteAdresseUseCase } from './delete-adresse.use-case';
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

describe('DeleteAdresseUseCase', () => {
    let useCase: DeleteAdresseUseCase;
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
        useCase = new DeleteAdresseUseCase(mockRepo);
    });

    it('devrait lever une NotFoundException si la liaison est introuvable', async () => {
        mockRepo.findByIdAndUser.mockResolvedValue(null);

        await expect(useCase.execute('pss-inconnu', 'user-1')).rejects.toThrow(NotFoundException);
        expect(mockRepo.softDelete).not.toHaveBeenCalled();
    });

    it('devrait lever une BadRequestException si c\'est la dernière adresse active', async () => {
        const existing = makeAdresse();
        mockRepo.findByIdAndUser.mockResolvedValue(existing);
        mockRepo.findAllByUser.mockResolvedValue([existing]); // une seule adresse

        await expect(useCase.execute('pss-1', 'user-1')).rejects.toThrow(BadRequestException);
        expect(mockRepo.softDelete).not.toHaveBeenCalled();
    });

    it('devrait effectuer un soft-delete de la liaison', async () => {
        const existing = makeAdresse();
        const other = makeAdresse({ id: 'pss-2', adresseId: 'adr-2' });
        mockRepo.findByIdAndUser.mockResolvedValue(existing);
        mockRepo.findAllByUser.mockResolvedValue([existing, other]); // deux adresses → suppression permise
        mockRepo.softDelete.mockResolvedValue(undefined);

        await useCase.execute('pss-1', 'user-1');

        expect(mockRepo.findByIdAndUser).toHaveBeenCalledWith('pss-1', 'user-1');
        expect(mockRepo.softDelete).toHaveBeenCalledWith('pss-1');
    });
});
