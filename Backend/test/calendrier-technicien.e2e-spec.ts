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

// Page d'un technicien (séquence de l'US-01) :
// - GET …/techniciens/:id/calendrier?mois= : ses jours planifiés, un point
//   par jour (même format que le calendrier de couverture) ;
// - GET …/techniciens/:id/journee?date=    : sa journée en créneaux (même
//   format que sa carte sur la page de couverture).
// Les instants sont écrits en UTC, comme en base. En juin, Paris est à UTC+2 :
// 2026-06-10T21:30Z = 10/06 à 23h30 à Paris ; 2026-06-10T22:30Z = 11/06 à 0h30.

type Zone = { id: string; couleur: string; isActive: boolean };
type JourCouvert = { jour: string; zones: Zone[] };
type Journee = {
    id: string;
    zone: Zone | null;
    creneaux: { debut: number; statut: string }[];
};

// Guillemets doubles : le nom exact de l'US contient une apostrophe droite
describe("US-01 Consulter le calendrier et la journée d'un technicien 2.0", () => {
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

    const base = (id: string) => `/api/admin/planning/techniciens/${id}`;

    /** Un admin connecté et le technicien dont on consulte la page. */
    async function preparer() {
        const admin = await creerUtilisateur(t.prisma, 'admin');
        const technicien = await creerUtilisateur(t.prisma, 'technicien');
        return {
            cookies: await seConnecter(t.app, admin),
            technicienId: technicien.id,
        };
    }

    /** Les jours planifiés d'un technicien pour un mois. */
    async function calendrier(
        cookies: string[],
        technicienId: string,
        mois: string,
    ): Promise<JourCouvert[]> {
        const reponse = await request(serveur)
            .get(`${base(technicienId)}/calendrier`)
            .query({ mois })
            .set('Cookie', cookies)
            .expect(200);
        return (reponse.body as { jours: JourCouvert[] }).jours;
    }

    /** Crée un créneau Libre à un instant UTC. */
    function creneau(technicienId: string, zoneId: string, instant: string) {
        return creerCreneau(t.prisma, {
            technicienId,
            zoneId,
            dateDebut: new Date(instant),
        });
    }

    it('CA01 — refuse l’accès à un utilisateur sans le rôle admin [RG1]', async () => {
        const { technicienId } = await preparer();

        for (const role of ['client', 'technicien'] as const) {
            const cookies = await seConnecter(
                t.app,
                await creerUtilisateur(t.prisma, role),
            );
            await request(serveur)
                .get(`${base(technicienId)}/calendrier`)
                .query({ mois: '2026-06' })
                .set('Cookie', cookies)
                .expect(403);
            await request(serveur)
                .get(`${base(technicienId)}/journee`)
                .query({ date: '2026-06-11' })
                .set('Cookie', cookies)
                .expect(403);
        }
    });

    it('CA02 — répond « introuvable » pour un technicien inexistant [—]', async () => {
        const { cookies } = await preparer();
        const client = await creerUtilisateur(t.prisma, 'client');

        // Un id inconnu, ou celui d'un utilisateur qui n'est pas technicien
        for (const id of ['00000000-0000-4000-8000-000000000000', client.id]) {
            await request(serveur)
                .get(`${base(id)}/calendrier`)
                .query({ mois: '2026-06' })
                .set('Cookie', cookies)
                .expect(404);
            await request(serveur)
                .get(`${base(id)}/journee`)
                .query({ date: '2026-06-11' })
                .set('Cookie', cookies)
                .expect(404);
        }
    });

    it('CA04 — un jour où le technicien a des créneaux porte un seul point, de la couleur de sa zone [RG2]', async () => {
        const { cookies, technicienId } = await preparer();
        const zone = await creerZone(t.prisma, { couleur: 'Bleu' });
        // Trois créneaux le même jour : toujours un seul point
        for (const instant of [
            '2026-06-03T06:00:00.000Z',
            '2026-06-03T06:30:00.000Z',
            '2026-06-03T12:00:00.000Z',
        ]) {
            await creneau(technicienId, zone.id, instant);
        }
        // Fuseau : 11/06 à 0h30 à Paris, mais encore le 10/06 en UTC
        await creneau(technicienId, zone.id, '2026-06-10T22:30:00.000Z');
        // Un autre technicien, dans une autre zone, le même jour : son point
        // n'est pas celui de ce technicien
        const autre = await creerUtilisateur(t.prisma, 'technicien');
        const autreZone = await creerZone(t.prisma, { couleur: 'Rouge' });
        await creneau(autre.id, autreZone.id, '2026-06-03T08:00:00.000Z');

        const jours = await calendrier(cookies, technicienId, '2026-06');

        expect(jours.map((j) => j.jour)).toEqual(['2026-06-03', '2026-06-11']);
        for (const j of jours) {
            expect(j.zones).toHaveLength(1);
            expect(j.zones[0]).toMatchObject({
                id: zone.id,
                couleur: 'Bleu',
                isActive: true,
            });
        }
    });

    it('CA05 — un jour sans créneau ne porte aucun point [RG2]', async () => {
        const { cookies, technicienId } = await preparer();
        const zone = await creerZone(t.prisma);
        await creneau(technicienId, zone.id, '2026-06-03T08:00:00.000Z');
        // Le 04/06, seul un autre technicien travaille
        const autre = await creerUtilisateur(t.prisma, 'technicien');
        await creneau(autre.id, zone.id, '2026-06-04T08:00:00.000Z');

        const jours = await calendrier(cookies, technicienId, '2026-06');

        expect(jours.map((j) => j.jour)).toEqual(['2026-06-03']);
    });

    it('CA06 — le point d’une zone inactive couverte par le technicien reste visible [RG2]', async () => {
        const { cookies, technicienId } = await preparer();
        const inactive = await creerZone(t.prisma, {
            couleur: 'Vert',
            isActive: false,
        });
        await creneau(technicienId, inactive.id, '2026-06-03T08:00:00.000Z');

        const jours = await calendrier(cookies, technicienId, '2026-06');

        // Le jour est renvoyé, avec sa zone inactive : la page l'affiche en
        // gris clair (couleurAffichee), la couleur enregistrée est conservée
        expect(jours).toEqual([
            {
                jour: '2026-06-03',
                zones: [
                    expect.objectContaining({
                        id: inactive.id,
                        couleur: 'Vert',
                        isActive: false,
                    }) as Zone,
                ],
            },
        ]);
    });

    it('CA07 — affiche la journée du jour choisi [—]', async () => {
        const { cookies, technicienId } = await preparer();
        const zone = await creerZone(t.prisma, { couleur: 'Bleu' });
        // Le 11/06 à Paris : 0h30 (10/06 en UTC), 8h00 réservé, 8h30 déplacement
        await creneau(technicienId, zone.id, '2026-06-10T22:30:00.000Z');
        await creerCreneau(t.prisma, {
            technicienId,
            zoneId: zone.id,
            dateDebut: new Date('2026-06-11T06:00:00.000Z'),
            statut: StatutCreneau.InterventionReservee,
        });
        await creerCreneau(t.prisma, {
            technicienId,
            zoneId: zone.id,
            dateDebut: new Date('2026-06-11T06:30:00.000Z'),
            statut: StatutCreneau.Deplacement,
        });
        // Hors du jour : le 10/06 à 23h30 et le 12/06 à 8h00, heure de Paris
        await creneau(technicienId, zone.id, '2026-06-10T21:30:00.000Z');
        await creneau(technicienId, zone.id, '2026-06-12T06:00:00.000Z');
        // Un autre technicien le même jour : absent de cette journée
        const autre = await creerUtilisateur(t.prisma, 'technicien');
        await creneau(autre.id, zone.id, '2026-06-11T07:00:00.000Z');

        const reponse = await request(serveur)
            .get(`${base(technicienId)}/journee`)
            .query({ date: '2026-06-11' })
            .set('Cookie', cookies)
            .expect(200);

        const journee = reponse.body as Journee;
        expect(journee.id).toBe(technicienId);
        expect(journee.zone).toMatchObject({ id: zone.id, couleur: 'Bleu' });
        // Minutes d'horloge à Paris, triées, avec leur statut
        expect(journee.creneaux).toEqual([
            { debut: 30, statut: 'Libre' },
            { debut: 480, statut: 'InterventionReservee' },
            { debut: 510, statut: 'Deplacement' },
        ]);
    });

    it('CA08 — affiche les points du mois demandé, y compris dans le passé [RG6]', async () => {
        const { cookies, technicienId } = await preparer();
        const zone = await creerZone(t.prisma);
        // Un mois passé et ses bornes en heure de Paris : 30/06 à 23h30
        // (juin) et 1er/07 à 0h30 (juillet, bien que le 30/06 en UTC)
        for (const instant of [
            '2025-06-12T08:00:00.000Z',
            '2025-06-30T21:30:00.000Z',
            '2025-06-30T22:30:00.000Z',
        ]) {
            await creneau(technicienId, zone.id, instant);
        }

        const juin = await calendrier(cookies, technicienId, '2025-06');
        const juillet = await calendrier(cookies, technicienId, '2025-07');

        expect(juin.map((j) => j.jour)).toEqual(['2025-06-12', '2025-06-30']);
        expect(juillet.map((j) => j.jour)).toEqual(['2025-07-01']);
    });
});
