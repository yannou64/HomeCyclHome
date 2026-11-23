import { BadRequestException } from '@nestjs/common';
import type { PlanifierTechnicienDto } from '../dto/input/planifier-technicien.dto';
import type { IPlanningRepository } from '../repositories/planning.repository.interface';
import { ApercuPlanificationUseCase } from './apercu-planification.use-case';

// Validation d'une planification par le use case : ce qui dépend de plusieurs
// valeurs (blocs entre eux, dates entre elles et par rapport à aujourd'hui).
// Ce qui est faux en soi (bornes, pas, champs absents) est refusé par le DTO
// et testé en intégration : test/definir-planification.e2e-spec.ts.
describe('US-02 Définir les blocs, la zone, les jours et la période 2.0', () => {
    let repo: Pick<
        jest.Mocked<IPlanningRepository>,
        'technicienExiste' | 'zoneAffecteeEtActive'
    >;
    let useCase: ApercuPlanificationUseCase;

    // Horloge figée le lundi 23/11/2026 à 10h00 à Paris : demain = 24/11
    const MAINTENANT = new Date('2026-11-23T09:00:00.000Z');

    /** Une saisie valide (semaine du 30/11), à surcharger champ par champ. */
    function saisie(
        surcharge: Partial<PlanifierTechnicienDto> = {},
    ): PlanifierTechnicienDto {
        return {
            zoneId: 'zone-1',
            jours: ['lundi', 'mercredi'],
            blocs: [
                { debut: 480, fin: 720 },
                { debut: 840, fin: 1080 },
            ],
            dateDebut: '2026-11-30',
            dateFin: '2026-12-06',
            ...surcharge,
        };
    }

    beforeEach(() => {
        jest.useFakeTimers({ now: MAINTENANT });
        repo = {
            technicienExiste: jest.fn().mockResolvedValue(true),
            zoneAffecteeEtActive: jest.fn().mockResolvedValue(true),
        };
        useCase = new ApercuPlanificationUseCase(
            repo as unknown as IPlanningRepository,
        );
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('CA10 — refuse un bloc dont la fin n’est pas strictement supérieure au début [RG2]', async () => {
        // Fin égale au début, puis fin avant le début
        for (const bloc of [
            { debut: 600, fin: 600 },
            { debut: 720, fin: 600 },
        ]) {
            await expect(
                useCase.execute('technicien-1', saisie({ blocs: [bloc] })),
            ).rejects.toThrow(BadRequestException);
        }
        // Témoin : la saisie de base est acceptée
        await expect(
            useCase.execute('technicien-1', saisie()),
        ).resolves.toBeUndefined();
    });

    it('CA11 — refuse un bloc qui chevauche un bloc existant [RG3]', async () => {
        // 10h00–13h00 chevauche 8h00–12h00
        await expect(
            useCase.execute(
                'technicien-1',
                saisie({
                    blocs: [
                        { debut: 480, fin: 720 },
                        { debut: 600, fin: 780 },
                    ],
                }),
            ),
        ).rejects.toThrow(/se chevauchent/);
        // Deux blocs contigus ne se chevauchent pas (écart du 18/11/2026)
        await expect(
            useCase.execute(
                'technicien-1',
                saisie({
                    blocs: [
                        { debut: 480, fin: 600 },
                        { debut: 600, fin: 720 },
                    ],
                }),
            ),
        ).resolves.toBeUndefined();
    });

    it('CA16 — refuse une date de début antérieure à demain, dans le fuseau d’exploitation [RG6]', async () => {
        // Aujourd'hui (23/11) est refusé, demain (24/11) accepté
        await expect(
            useCase.execute(
                'technicien-1',
                saisie({ dateDebut: '2026-11-23', dateFin: '2026-11-30' }),
            ),
        ).rejects.toThrow(BadRequestException);
        await expect(
            useCase.execute(
                'technicien-1',
                saisie({ dateDebut: '2026-11-24', dateFin: '2026-11-30' }),
            ),
        ).resolves.toBeUndefined();

        // Fuseau : le 30/11 à 23h30 UTC, il est déjà 0h30 le 1er/12 à Paris.
        // Le 1er/12 est donc aujourd'hui, refusé ; en UTC il serait demain.
        jest.setSystemTime(new Date('2026-11-30T23:30:00.000Z'));
        await expect(
            useCase.execute(
                'technicien-1',
                saisie({ dateDebut: '2026-12-01', dateFin: '2026-12-07' }),
            ),
        ).rejects.toThrow(BadRequestException);
    });

    it('CA17 — refuse une date de fin antérieure à la date de début [RG6]', async () => {
        await expect(
            useCase.execute(
                'technicien-1',
                saisie({ dateDebut: '2026-11-30', dateFin: '2026-11-29' }),
            ),
        ).rejects.toThrow(BadRequestException);
        // Fin égale au début : une seule journée, acceptée (« supérieure ou
        // égale », RG6)
        await expect(
            useCase.execute(
                'technicien-1',
                saisie({ dateDebut: '2026-11-30', dateFin: '2026-11-30' }),
            ),
        ).resolves.toBeUndefined();
    });
});
