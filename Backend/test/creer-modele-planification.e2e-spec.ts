import type { Server } from 'http';
import request from 'supertest';
import {
    creerApplicationDeTest,
    ApplicationDeTest,
} from './helpers/application';
import { viderLaBase } from './helpers/base';
import {
    creerAffectation,
    creerCreneau,
    creerModele,
    creerUtilisateur,
    creerZone,
} from './helpers/fabriques';
import { seConnecter } from './helpers/connexion';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../src/features/planning/repositories/planning.repository.interface';

// Les blocs horaires circulent en minutes depuis minuit : 480 = 8h00.
// Bornes de RG4 : 420 (7h00) à 1200 (20h00), par pas de 30 minutes.
type CorpsModele = {
    intitule?: string;
    zoneId?: string;
    jours?: string[];
    blocs?: { debut: number; fin: number }[];
};

describe('US-01 Créer un modèle de planification 2.0', () => {
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

    /**
     * Prépare le cas nominal : un admin connecté, un technicien affecté à une
     * zone active. Renvoie de quoi appeler la route et vérifier la base.
     */
    async function preparer(): Promise<{
        cookies: string[];
        technicienId: string;
        zoneId: string;
        route: string;
    }> {
        const admin = await creerUtilisateur(t.prisma, 'admin');
        const technicien = await creerUtilisateur(t.prisma, 'technicien');
        const zone = await creerZone(t.prisma);
        await creerAffectation(t.prisma, technicien.id, zone.id);
        return {
            cookies: await seConnecter(t.app, admin),
            technicienId: technicien.id,
            zoneId: zone.id,
            route: `/api/admin/planning/techniciens/${technicien.id}/modeles`,
        };
    }

    /** Une saisie valide, à surcharger champ par champ. */
    function corpsValide(zoneId: string, surcharge: CorpsModele = {}) {
        return {
            intitule: 'Semaine matin',
            zoneId,
            jours: ['lundi', 'mardi'],
            blocs: [{ debut: 480, fin: 720 }],
            ...surcharge,
        };
    }

    it('CA01 — refuse l’accès à un utilisateur sans le rôle admin [RG1]', async () => {
        const technicien = await creerUtilisateur(t.prisma, 'technicien');
        const zone = await creerZone(t.prisma);
        await creerAffectation(t.prisma, technicien.id, zone.id);
        const base = `/api/admin/planning/techniciens/${technicien.id}`;

        for (const role of ['client', 'technicien'] as const) {
            const cookies = await seConnecter(
                t.app,
                await creerUtilisateur(t.prisma, role),
            );
            await request(serveur)
                .get(`${base}/zones`)
                .set('Cookie', cookies)
                .expect(403);
            await request(serveur)
                .post(`${base}/modeles`)
                .set('Cookie', cookies)
                .send(corpsValide(zone.id))
                .expect(403);
        }

        expect(await t.prisma.modelePlanification.count()).toBe(0);
    });

    it('CA02 — répond « introuvable » quand le technicien n’existe pas [—]', async () => {
        const cookies = await seConnecter(
            t.app,
            await creerUtilisateur(t.prisma, 'admin'),
        );
        // Écart du 18/11/2026 : un utilisateur qui n'est pas technicien est
        // traité comme introuvable
        const client = await creerUtilisateur(t.prisma, 'client');

        for (const id of ['00000000-0000-4000-8000-000000000000', client.id]) {
            await request(serveur)
                .get(`/api/admin/planning/techniciens/${id}/zones`)
                .set('Cookie', cookies)
                .expect(404);
        }
    });

    it('CA04 — refuse un intitulé absent ou vide [RG3]', async () => {
        const { cookies, zoneId, route } = await preparer();

        for (const intitule of [undefined, '', '   ']) {
            await request(serveur)
                .post(route)
                .set('Cookie', cookies)
                .send(corpsValide(zoneId, { intitule }))
                .expect(400);
        }

        expect(await t.prisma.modelePlanification.count()).toBe(0);
    });

    it('CA05 — refuse un intitulé de plus de 100 caractères [RG3]', async () => {
        const { cookies, zoneId, route } = await preparer();

        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corpsValide(zoneId, { intitule: 'a'.repeat(101) }))
            .expect(400);
        // 100 caractères exactement : accepté
        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corpsValide(zoneId, { intitule: 'a'.repeat(100) }))
            .expect(201);

        expect(await t.prisma.modelePlanification.count()).toBe(1);
    });

    it('CA06 — refuse un intitulé déjà utilisé pour ce technicien [RG3]', async () => {
        const { cookies, technicienId, zoneId, route } = await preparer();
        await creerModele(t.prisma, {
            technicienId,
            zoneId,
            intitule: 'Matin',
        });

        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corpsValide(zoneId, { intitule: 'Matin' }))
            .expect(409);

        expect(await t.prisma.modelePlanification.count()).toBe(1);
    });

    it('CA07 — refuse comme doublon un intitulé qui ne diffère que par la casse ou les espaces autour [RG3]', async () => {
        const { cookies, technicienId, zoneId, route } = await preparer();
        await creerModele(t.prisma, {
            technicienId,
            zoneId,
            intitule: 'Matin',
        });

        for (const intitule of ['matin', 'MATIN', '  Matin  ']) {
            await request(serveur)
                .post(route)
                .set('Cookie', cookies)
                .send(corpsValide(zoneId, { intitule }))
                .expect(409);
        }

        expect(await t.prisma.modelePlanification.count()).toBe(1);
    });

    it('CA08 — accepte un intitulé utilisé par un autre technicien [RG3]', async () => {
        const { cookies, zoneId, route } = await preparer();
        const autre = await creerUtilisateur(t.prisma, 'technicien');
        await creerAffectation(t.prisma, autre.id, zoneId);
        await creerModele(t.prisma, {
            technicienId: autre.id,
            zoneId,
            intitule: 'Matin',
        });

        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corpsValide(zoneId, { intitule: 'Matin' }))
            .expect(201);

        expect(await t.prisma.modelePlanification.count()).toBe(2);
    });

    it('CA09 — refuse un bloc hors 7h00–20h00, hors pas de 30 min ou dont la fin n’est pas après le début [RG4]', async () => {
        const { cookies, zoneId, route } = await preparer();

        const blocsInvalides = [
            { debut: 390, fin: 600 }, // commence à 6h30 : avant 7h00
            { debut: 1080, fin: 1230 }, // finit à 20h30 : après 20h00
            { debut: 495, fin: 600 }, // 8h15 : hors du pas de 30 min
            { debut: 480, fin: 615 }, // 10h15 : hors du pas de 30 min
            { debut: 600, fin: 600 }, // fin égale au début
            { debut: 720, fin: 600 }, // fin avant le début
        ];
        for (const bloc of blocsInvalides) {
            await request(serveur)
                .post(route)
                .set('Cookie', cookies)
                .send(corpsValide(zoneId, { blocs: [bloc] }))
                .expect(400);
        }
        expect(await t.prisma.modelePlanification.count()).toBe(0);

        // Les bornes exactes 7h00 et 20h00 sont acceptées
        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corpsValide(zoneId, { blocs: [{ debut: 420, fin: 1200 }] }))
            .expect(201);
    });

    it('CA11 — refuse un modèle sans bloc [RG4]', async () => {
        const { cookies, zoneId, route } = await preparer();

        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corpsValide(zoneId, { blocs: [] }))
            .expect(400);

        expect(await t.prisma.modelePlanification.count()).toBe(0);
    });

    it('CA12 — refuse une zone non affectée au technicien ou inactive [RG5]', async () => {
        const { cookies, technicienId, route } = await preparer();
        const zoneNonAffectee = await creerZone(t.prisma);
        const zoneInactive = await creerZone(t.prisma, { isActive: false });
        await creerAffectation(t.prisma, technicienId, zoneInactive.id);

        for (const zone of [zoneNonAffectee, zoneInactive]) {
            await request(serveur)
                .post(route)
                .set('Cookie', cookies)
                .send(corpsValide(zone.id))
                .expect(400);
        }

        expect(await t.prisma.modelePlanification.count()).toBe(0);
    });

    it('CA13 — refuse un modèle sans jour de semaine [RG6]', async () => {
        const { cookies, zoneId, route } = await preparer();

        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corpsValide(zoneId, { jours: [] }))
            .expect(400);

        expect(await t.prisma.modelePlanification.count()).toBe(0);
    });

    it('CA14 — enregistre le modèle avec son technicien, sa zone, ses jours et ses blocs [RG2]', async () => {
        const { cookies, technicienId, zoneId, route } = await preparer();

        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(
                corpsValide(zoneId, {
                    intitule: '  Semaine complète  ',
                    jours: ['lundi', 'mercredi', 'vendredi'],
                    blocs: [
                        { debut: 840, fin: 1020 },
                        { debut: 480, fin: 720 },
                    ],
                }),
            )
            .expect(201);

        const modele = await t.prisma.modelePlanification.findFirstOrThrow({
            include: { blocs: { orderBy: { debut: 'asc' } } },
        });
        expect(modele).toMatchObject({
            intitule: 'Semaine complète', // enregistré sans les espaces autour
            technicien_id: technicienId,
            zone_id: zoneId,
            lundi: true,
            mardi: false,
            mercredi: true,
            jeudi: false,
            vendredi: true,
            samedi: false,
            dimanche: false,
        });
        expect(modele.blocs.map((b) => [b.debut, b.fin])).toEqual([
            [480, 720],
            [840, 1020],
        ]);
    });

    it('CA15 — ne crée aucun créneau [RG7]', async () => {
        const { cookies, technicienId, zoneId, route } = await preparer();
        await creerCreneau(t.prisma, { technicienId, zoneId });

        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corpsValide(zoneId))
            .expect(201);

        // Le seul créneau est celui créé avant : le modèle n'en produit aucun
        expect(await t.prisma.creneau.count()).toBe(1);
    });

    it('CA18 — n’enregistre rien quand une écriture échoue : tout ou rien [—]', async () => {
        const { technicienId, zoneId } = await preparer();
        const repo = t.app.get<IPlanningRepository>(PLANNING_REPO);

        // Appel direct du repository, sans DTO ni use case : le second bloc
        // (fin avant début) est refusé par la contrainte CHECK de la base,
        // APRÈS l'écriture du modèle et du premier bloc dans la transaction
        await expect(
            repo.creerModele({
                technicienId,
                zoneId,
                intitule: 'Échec en cours de route',
                jours: ['lundi'],
                blocs: [
                    { debut: 480, fin: 720 },
                    { debut: 900, fin: 840 },
                ],
            }),
        ).rejects.toThrow();

        // La transaction a été annulée : ni modèle, ni bloc
        expect(await t.prisma.modelePlanification.count()).toBe(0);
        expect(await t.prisma.blocHoraire.count()).toBe(0);
    });
});
