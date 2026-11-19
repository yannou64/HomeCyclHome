import { BadRequestException } from '@nestjs/common';
import type { IPlanningRepository } from '../repositories/planning.repository.interface';
import { CreateModelePlanificationUseCase } from './create-modele-planification.use-case';

// Le chevauchement de blocs est une règle du use case (RG4) : il se teste ici,
// avec un repository simulé qui accepte tout le reste (technicien trouvé, zone
// valide, intitulé libre). Les autres critères de l'US se testent en
// intégration : test/creer-modele-planification.e2e-spec.ts.
describe('US-01 Créer un modèle de planification 2.0', () => {
    let repo: jest.Mocked<IPlanningRepository>;
    let useCase: CreateModelePlanificationUseCase;

    beforeEach(() => {
        repo = {
            technicienExiste: jest.fn().mockResolvedValue(true),
            trouverZonesProposees: jest.fn().mockResolvedValue([]),
            zoneAffecteeEtActive: jest.fn().mockResolvedValue(true),
            intituleExiste: jest.fn().mockResolvedValue(false),
            trouverModeles: jest.fn().mockResolvedValue([]),
            creerModele: jest.fn().mockResolvedValue({ id: 'modele-1' }),
            trouverModele: jest.fn().mockResolvedValue(null),
            supprimerModele: jest.fn().mockResolvedValue(true),
            modifierModele: jest.fn().mockResolvedValue(null),
        };
        useCase = new CreateModelePlanificationUseCase(repo);
    });

    /** Saisie valide, aux blocs près. */
    const saisie = (blocs: { debut: number; fin: number }[]) => ({
        intitule: 'Semaine',
        zoneId: 'zone-1',
        jours: ['lundi' as const],
        blocs,
    });

    it('CA10 — refuse la création d’un bloc qui en chevauche un autre [RG4]', async () => {
        // 8h00–12h00 et 10h00–13h00 se chevauchent de 10h00 à 12h00
        await expect(
            useCase.execute(
                'technicien-1',
                saisie([
                    { debut: 480, fin: 720 },
                    { debut: 600, fin: 780 },
                ]),
            ),
        ).rejects.toThrow(BadRequestException);
        expect(repo.creerModele).not.toHaveBeenCalled();

        // Écart du 18/11/2026 : deux blocs contigus (8h–10h puis 10h–12h) ne
        // se chevauchent pas et sont acceptés
        await useCase.execute(
            'technicien-1',
            saisie([
                { debut: 600, fin: 720 },
                { debut: 480, fin: 600 },
            ]),
        );
        expect(repo.creerModele).toHaveBeenCalledTimes(1);
    });
});
