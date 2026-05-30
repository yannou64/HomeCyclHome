import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { IPlanningRepository } from '../repositories/planning.repository.interface';
import { UpdateModelePlanificationUseCase } from './update-modele-planification.use-case';

const existingModele = {
    id: 'modele-uuid-1',
    technicien_id: 'tech-uuid-1',
    zone_id: 'zone-uuid-1',
    jour_semaine: 1,
    heure_debut: 480,
    heure_fin: 1020,
    intervalle_minutes: 60,
    is_actif: true,
    date_debut_validite: '2026-06-01T00:00:00.000Z',
    date_fin_validite: null,
};

describe('UpdateModelePlanificationUseCase', () => {
    let useCase: UpdateModelePlanificationUseCase;
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
        useCase = new UpdateModelePlanificationUseCase(mockRepo);
    });

    it('devrait mettre à jour le modèle si aucun conflit', async () => {
        mockRepo.findModeleById.mockResolvedValue(existingModele);
        mockRepo.findModelesChevauchants.mockResolvedValue([]);
        mockRepo.updateModele.mockResolvedValue({
            ...existingModele,
            intervalle_minutes: 90,
        });

        const result = await useCase.execute('modele-uuid-1', {
            intervalle_minutes: 90,
        });

        expect(mockRepo.findModeleById).toHaveBeenCalledWith('modele-uuid-1');
        expect(mockRepo.updateModele).toHaveBeenCalledWith('modele-uuid-1', {
            intervalle_minutes: 90,
        });
        expect(result.intervalle_minutes).toBe(90);
    });

    it('devrait lever NotFoundException si le modèle est introuvable', async () => {
        mockRepo.findModeleById.mockResolvedValue(null);

        await expect(useCase.execute('inconnu-uuid', {})).rejects.toThrow(
            NotFoundException,
        );

        expect(mockRepo.updateModele).not.toHaveBeenCalled();
    });

    it('devrait lever BadRequestException si heure_fin <= heure_debut après fusion', async () => {
        mockRepo.findModeleById.mockResolvedValue(existingModele);

        // On modifie heure_fin pour qu'elle soit inférieure à heure_debut existant
        await expect(
            useCase.execute('modele-uuid-1', { heure_fin: 300 }),
        ).rejects.toThrow(BadRequestException);

        expect(mockRepo.updateModele).not.toHaveBeenCalled();
    });

    it('devrait lever ConflictException en cas de chevauchement (en excluant le modèle lui-même)', async () => {
        mockRepo.findModeleById.mockResolvedValue(existingModele);
        // Le repo retourne un conflit avec un AUTRE modèle
        mockRepo.findModelesChevauchants.mockResolvedValue([
            { ...existingModele, id: 'autre-modele-uuid' },
        ]);

        await expect(
            useCase.execute('modele-uuid-1', { heure_debut: 400 }),
        ).rejects.toThrow(ConflictException);

        // expect.anything() ne matche pas null — on utilise expect.toBeNil() n'existant pas,
        // on vérifie simplement que la fonction a été appelée avec le bon excludeId.
        // Les 5 premiers args sont des valeurs dérivées de existant/dto, le 6e est null (pas de date_fin).
        expect(mockRepo.findModelesChevauchants).toHaveBeenCalledWith(
            'tech-uuid-1', // technicien_id
            1, // jour_semaine (inchangé)
            400, // heure_debut (du dto)
            1020, // heure_fin (de existant)
            expect.any(Date), // dateDebutValidite
            null, // dateFinValidite — null car indéfinie dans existant
            'modele-uuid-1', // excludeId : clé de la règle à tester
        );
    });
});
