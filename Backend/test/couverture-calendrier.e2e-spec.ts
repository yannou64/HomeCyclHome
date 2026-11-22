import type { Server } from 'http';
import request from 'supertest';
import {
    creerApplicationDeTest,
    ApplicationDeTest,
} from './helpers/application';
import { viderLaBase } from './helpers/base';
import { creerCreneau, creerUtilisateur, creerZone } from './helpers/fabriques';
import { seConnecter } from './helpers/connexion';
import { StatutCreneau } from '../src/generated/prisma/client';

// Les instants sont écrits en UTC, comme en base. En juin, Paris est à UTC+2 :
// 2026-06-10T21:30Z = 10/06 à 23h30 à Paris ; 2026-06-10T22:30Z = 11/06 à 0h30.

type JourCouvert = {
    jour: string;
    zones: {
        id: string;
        nomZone: string;
        couleur: string;
        isActive: boolean;
    }[];
};

describe('US-01 Consulter le calendrier de couverture et choisir une date 2.0', () => {
    let t: ApplicationDeTest;
    let serveur: Server;

    beforeAll(async () => {
        t = await creerApplicationDeTest();
        serveur = t.app.getHttpServer() as Server;
    });

    beforeEach(async () => {
        await viderLaBase(t.prisma);
    });

    afterAll(async () => {
        await t.app.close();
    });

    /** Un admin connecté et un technicien, qui portera les créneaux. */
    async function preparer() {
        const admin = await creerUtilisateur(t.prisma, 'admin');
        const technicien = await creerUtilisateur(t.prisma, 'technicien');
        return {
            cookies: await seConnecter(t.app, admin),
            technicienId: technicien.id,
        };
    }

    /** Demande le calendrier d'un mois et renvoie ses jours couverts. */
    async function couverture(
        cookies: string[],
        mois: string,
    ): Promise<JourCouvert[]> {
        const reponse = await request(serveur)
            .get('/api/admin/planning/couverture')
            .query({ mois })
            .set('Cookie', cookies)
            .expect(200);
        return (reponse.body as { jours: JourCouvert[] }).jours;
    }

    /** Les zones d'un jour, réduites à leurs ids ([] si le jour est absent). */
    function zonesDu(jours: JourCouvert[], jour: string): string[] {
        return (jours.find((j) => j.jour === jour)?.zones ?? []).map(
            (z) => z.id,
        );
    }

    it('CA01 — refuse l’accès à un utilisateur sans le rôle admin [RG1]', async () => {
        for (const role of ['client', 'technicien'] as const) {
            const cookies = await seConnecter(
                t.app,
                await creerUtilisateur(t.prisma, role),
            );
            await request(serveur)
                .get('/api/admin/planning/couverture')
                .query({ mois: '2026-06' })
                .set('Cookie', cookies)
                .expect(403);
        }
    });

    it('CA04 — un jour où une zone a un créneau, quel que soit son statut, porte un tag de sa couleur [RG2, RG3]', async () => {
        const { cookies, technicienId } = await preparer();
        const zone = await creerZone(t.prisma, { couleur: 'Bleu' });

        // Un créneau de chaque statut, chacun un jour différent
        const statuts: [string, StatutCreneau][] = [
            ['2026-06-03T08:00:00.000Z', StatutCreneau.Libre],
            ['2026-06-04T08:00:00.000Z', StatutCreneau.Deplacement],
            ['2026-06-05T08:00:00.000Z', StatutCreneau.InterventionReservee],
        ];
        for (const [instant, statut] of statuts) {
            await creerCreneau(t.prisma, {
                technicienId,
                zoneId: zone.id,
                dateDebut: new Date(instant),
                statut,
            });
        }
        // Fuseau : 11/06 à 0h30 à Paris, mais encore le 10/06 en UTC
        await creerCreneau(t.prisma, {
            technicienId,
            zoneId: zone.id,
            dateDebut: new Date('2026-06-10T22:30:00.000Z'),
        });

        const jours = await couverture(cookies, '2026-06');

        for (const jour of ['2026-06-03', '2026-06-04', '2026-06-05']) {
            expect(zonesDu(jours, jour)).toEqual([zone.id]);
        }
        // Compté le jour de Paris, pas le jour UTC
        expect(zonesDu(jours, '2026-06-11')).toEqual([zone.id]);
        expect(zonesDu(jours, '2026-06-10')).toEqual([]);
        // Le tag porte la couleur de la zone
        const jour3 = jours.find((j) => j.jour === '2026-06-03');
        expect(jour3?.zones[0]).toMatchObject({
            couleur: 'Bleu',
            isActive: true,
        });
    });

    it('CA05 — un jour où deux zones ont des créneaux porte deux tags, un par zone [RG3]', async () => {
        const { cookies, technicienId } = await preparer();
        const autreTechnicien = await creerUtilisateur(t.prisma, 'technicien');
        const zoneA = await creerZone(t.prisma);
        const zoneB = await creerZone(t.prisma);

        // Zone A : deux créneaux le même jour, mais un seul tag attendu
        for (const instant of [
            '2026-06-08T08:00:00.000Z',
            '2026-06-08T08:30:00.000Z',
        ]) {
            await creerCreneau(t.prisma, {
                technicienId,
                zoneId: zoneA.id,
                dateDebut: new Date(instant),
            });
        }
        await creerCreneau(t.prisma, {
            technicienId: autreTechnicien.id,
            zoneId: zoneB.id,
            dateDebut: new Date('2026-06-08T12:00:00.000Z'),
        });

        const jours = await couverture(cookies, '2026-06');

        expect(zonesDu(jours, '2026-06-08').sort()).toEqual(
            [zoneA.id, zoneB.id].sort(),
        );
    });

    it('CA06 — un jour sans aucun créneau ne porte aucun tag [RG2, RG3]', async () => {
        const { cookies, technicienId } = await preparer();
        const zone = await creerZone(t.prisma);
        await creerCreneau(t.prisma, {
            technicienId,
            zoneId: zone.id,
            dateDebut: new Date('2026-06-15T08:00:00.000Z'),
        });

        const jours = await couverture(cookies, '2026-06');

        // Seul le 15 est couvert : aucun autre jour n'est listé
        expect(jours.map((j) => j.jour)).toEqual(['2026-06-15']);
    });

    it('CA07 — une zone inactive qui a encore des créneaux garde son tag [RG10, RG11]', async () => {
        const { cookies, technicienId } = await preparer();
        const zone = await creerZone(t.prisma, {
            couleur: 'Vert',
            isActive: false,
        });
        await creerCreneau(t.prisma, {
            technicienId,
            zoneId: zone.id,
            dateDebut: new Date('2026-06-16T08:00:00.000Z'),
        });

        const jours = await couverture(cookies, '2026-06');

        // Toujours là, marquée inactive : l'interface l'affiche en gris clair
        // (couleurAffichee), la couleur enregistrée est conservée
        expect(jours.find((j) => j.jour === '2026-06-16')?.zones).toEqual([
            {
                id: zone.id,
                nomZone: expect.any(String) as string,
                couleur: 'Vert',
                isActive: false,
            },
        ]);
    });

    it('CA08 — affiche les tags du mois demandé, y compris dans le passé [RG12]', async () => {
        const { cookies, technicienId } = await preparer();
        const zone = await creerZone(t.prisma);
        // Un mois passé, et ses bornes en heure de Paris : 30/06 à 23h30
        // (juin) et 1er/07 à 0h30 (juillet, bien que le 30/06 en UTC)
        const instants = [
            '2025-06-12T08:00:00.000Z',
            '2025-06-30T21:30:00.000Z',
            '2025-06-30T22:30:00.000Z',
        ];
        for (const instant of instants) {
            await creerCreneau(t.prisma, {
                technicienId,
                zoneId: zone.id,
                dateDebut: new Date(instant),
            });
        }

        const juin = await couverture(cookies, '2025-06');
        const juillet = await couverture(cookies, '2025-07');

        expect(juin.map((j) => j.jour)).toEqual(['2025-06-12', '2025-06-30']);
        expect(juillet.map((j) => j.jour)).toEqual(['2025-07-01']);
    });
});
