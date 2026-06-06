import { NotFoundException } from '@nestjs/common';
import { UpdateAdresseUseCase } from './update-adresse.use-case';
import type { IAdressesRepository } from '../repositories/adresses.repository.interface';
import type { AdresseDto } from '../dto/output/adresse.dto';
import type { UpdateAdresseInput } from '../dto/input/adresse-input.dto';

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

describe('UpdateAdresseUseCase', () => {
    let useCase: UpdateAdresseUseCase;
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
        useCase = new UpdateAdresseUseCase(mockRepo);
    });

    it('devrait lever une NotFoundException si la liaison est introuvable', async () => {
        mockRepo.findByIdAndUser.mockResolvedValue(null);

        await expect(
            useCase.execute('pss-inconnu', 'user-1', {
                titreDescription: 'Test',
            }),
        ).rejects.toThrow(NotFoundException);
    });

    it('devrait modifier le titre_description via updateMetadata', async () => {
        const existing = makeAdresse();
        const updated = makeAdresse({ titreDescription: 'Bureau' });

        mockRepo.findByIdAndUser.mockResolvedValue(existing);
        mockRepo.updateMetadata.mockResolvedValue(updated);

        const input: UpdateAdresseInput = { titreDescription: 'Bureau' };
        const result = await useCase.execute('pss-1', 'user-1', input);

        expect(mockRepo.updateMetadata).toHaveBeenCalledWith('pss-1', {
            titreDescription: 'Bureau',
        });
        expect(mockRepo.setPrincipal).not.toHaveBeenCalled();
        expect(result).toEqual(updated);
    });

    it('devrait appeler setPrincipal (transaction) quand adressePrincipal passe à true', async () => {
        const existing = makeAdresse({ adressePrincipal: false });
        const updated = makeAdresse({ adressePrincipal: true });

        mockRepo.findByIdAndUser.mockResolvedValue(existing);
        mockRepo.setPrincipal.mockResolvedValue(updated);

        const input: UpdateAdresseInput = { adressePrincipal: true };
        const result = await useCase.execute('pss-1', 'user-1', input);

        expect(mockRepo.setPrincipal).toHaveBeenCalledWith('pss-1', 'user-1');
        expect(mockRepo.updateMetadata).not.toHaveBeenCalled();
        expect(result).toEqual(updated);
    });

    it('devrait appeler unsetPrincipal quand adressePrincipal passe à false', async () => {
        const existing = makeAdresse({ adressePrincipal: true });
        const updated = makeAdresse({ adressePrincipal: false });

        mockRepo.findByIdAndUser.mockResolvedValue(existing);
        mockRepo.unsetPrincipal.mockResolvedValue(updated);

        const input: UpdateAdresseInput = { adressePrincipal: false };
        const result = await useCase.execute('pss-1', 'user-1', input);

        expect(mockRepo.unsetPrincipal).toHaveBeenCalledWith('pss-1');
        expect(mockRepo.setPrincipal).not.toHaveBeenCalled();
        expect(result).toEqual(updated);
    });

    it('devrait gérer la mise à jour simultanée du titre et du statut principal', async () => {
        const existing = makeAdresse({ adressePrincipal: false });
        const afterPrincipal = makeAdresse({ adressePrincipal: true });
        const afterMeta = makeAdresse({
            adressePrincipal: true,
            titreDescription: 'Maison',
        });

        mockRepo.findByIdAndUser.mockResolvedValue(existing);
        mockRepo.setPrincipal.mockResolvedValue(afterPrincipal);
        mockRepo.updateMetadata.mockResolvedValue(afterMeta);

        const input: UpdateAdresseInput = {
            adressePrincipal: true,
            titreDescription: 'Maison',
        };
        const result = await useCase.execute('pss-1', 'user-1', input);

        expect(mockRepo.setPrincipal).toHaveBeenCalledWith('pss-1', 'user-1');
        expect(mockRepo.updateMetadata).toHaveBeenCalledWith('pss-1', {
            titreDescription: 'Maison',
        });
        expect(result).toEqual(afterMeta);
    });
});
