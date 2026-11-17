import type { Server } from 'http';
import request from 'supertest';
import {
    creerApplicationDeTest,
    ApplicationDeTest,
} from './helpers/application';
import { viderLaBase } from './helpers/base';
import {
    creerCreneau,
    creerIntervention,
    creerUtilisateur,
    creerZone,
} from './helpers/fabriques';
import { seConnecter } from './helpers/connexion';

// Message de refus d'une couleur hors palette (RG2 : « refusée », message précis).
// Le texte liste les 12 noms acceptés, dans l'ordre de la palette.
const MESSAGE_COULEUR =
    "La couleur doit être l'une des 12 couleurs de la palette : Rouge, Orange, Jaune, Lime, Vert, Turquoise, Cyan, Bleu, Indigo, Violet, Prune, Rose.";

// Tracé minimal d'une zone (3 points), envoyé dans le corps des requêtes
const TRACE = [
    { latitude: 45.76, longitude: 4.83, ordre: 0 },
    { latitude: 45.77, longitude: 4.85, ordre: 1 },
    { latitude: 45.75, longitude: 4.86, ordre: 2 },
];

// Critères manuels (écart du 17/11/2026, option A) : CA02, CA03, CA04, CA13 et
// CA14 portent sur l'affichage du formulaire et du planning, sans test frontend.
describe("US-01 Choisir la couleur d'une zone 2.0", () => {
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

    /** Connecte un nouvel admin et renvoie ses cookies. */
    async function cookiesAdmin(): Promise<string[]> {
        return seConnecter(t.app, await creerUtilisateur(t.prisma, 'admin'));
    }

    it('CA01 — refuse la lecture et l’enregistrement d’une zone à un utilisateur sans le rôle admin [RG1]', async () => {
        const zone = await creerZone(t.prisma);

        for (const role of ['client', 'technicien'] as const) {
            const cookies = await seConnecter(
                t.app,
                await creerUtilisateur(t.prisma, role),
            );
            await request(serveur)
                .get(`/api/admin/zones/${zone.id}`)
                .set('Cookie', cookies)
                .expect(403);
            await request(serveur)
                .post('/api/admin/zones')
                .set('Cookie', cookies)
                .send({ nomZone: 'Interdite', couleur: 'Bleu', points: TRACE })
                .expect(403);
            await request(serveur)
                .patch(`/api/admin/zones/${zone.id}`)
                .set('Cookie', cookies)
                .send({ couleur: 'Bleu' })
                .expect(403);
        }

        // Rien n'a été écrit : la zone garde sa couleur, aucune zone créée
        expect(await t.prisma.zone.count()).toBe(1);
        expect(
            (await t.prisma.zone.findUniqueOrThrow({ where: { id: zone.id } }))
                .couleur,
        ).toBe('Rouge');
    });

    it('CA05 — renvoie la couleur par son nom, pas par son code hexadécimal [RG2]', async () => {
        const zone = await creerZone(t.prisma, { couleur: 'Bleu' });

        const reponse = await request(serveur)
            .get(`/api/admin/zones/${zone.id}`)
            .set('Cookie', await cookiesAdmin())
            .expect(200);

        expect((reponse.body as { couleur: string }).couleur).toBe('Bleu');
    });

    it('CA06 — refuse la création d’une zone sans couleur [RG2]', async () => {
        await request(serveur)
            .post('/api/admin/zones')
            .set('Cookie', await cookiesAdmin())
            .send({ nomZone: 'Sans couleur', points: TRACE })
            .expect(400);

        expect(await t.prisma.zone.count()).toBe(0);
    });

    it('CA07 — refuse un nom hors énumération, un code hexadécimal ou le gris clair [RG2]', async () => {
        const cookies = await cookiesAdmin();

        for (const couleur of ['Marron', '#1c7ed6', 'Gris', '#ced4da']) {
            await request(serveur)
                .post('/api/admin/zones')
                .set('Cookie', cookies)
                .send({ nomZone: `Zone ${couleur}`, couleur, points: TRACE })
                .expect(400);
        }

        expect(await t.prisma.zone.count()).toBe(0);
    });

    it('CA08 — renvoie un message précis et laisse la zone inchangée, tracé compris [RG2]', async () => {
        const zone = await creerZone(t.prisma, { couleur: 'Vert' });
        const avant = await t.prisma.zone.findUniqueOrThrow({
            where: { id: zone.id },
            include: { points: { orderBy: { ordre: 'asc' } } },
        });

        // Nouveaux points valides, mais couleur invalide : rien ne doit être écrit
        const reponse = await request(serveur)
            .patch(`/api/admin/zones/${zone.id}`)
            .set('Cookie', await cookiesAdmin())
            .send({
                couleur: 'Marron',
                points: [
                    { latitude: 45.7, longitude: 4.8, ordre: 0 },
                    { latitude: 45.71, longitude: 4.81, ordre: 1 },
                    { latitude: 45.69, longitude: 4.82, ordre: 2 },
                    { latitude: 45.68, longitude: 4.8, ordre: 3 },
                ],
            })
            .expect(400);

        expect(
            (reponse.body as { message: string | string[] }).message,
        ).toContain(MESSAGE_COULEUR);
        const apres = await t.prisma.zone.findUniqueOrThrow({
            where: { id: zone.id },
            include: { points: { orderBy: { ordre: 'asc' } } },
        });
        expect(apres).toEqual(avant);
    });

    it('CA09 — enregistre le nom de la couleur avec la zone, à la création et à la modification [RG2]', async () => {
        const cookies = await cookiesAdmin();

        const creation = await request(serveur)
            .post('/api/admin/zones')
            .set('Cookie', cookies)
            .send({ nomZone: 'Croix-Rousse', couleur: 'Bleu', points: TRACE })
            .expect(201);
        const id = (creation.body as { id: string }).id;
        expect(
            (await t.prisma.zone.findUniqueOrThrow({ where: { id } })).couleur,
        ).toBe('Bleu');

        await request(serveur)
            .patch(`/api/admin/zones/${id}`)
            .set('Cookie', cookies)
            .send({ couleur: 'Prune' })
            .expect(200);
        expect(
            (await t.prisma.zone.findUniqueOrThrow({ where: { id } })).couleur,
        ).toBe('Prune');
    });

    it('CA10 — accepte la même couleur pour deux zones [RG2]', async () => {
        const cookies = await cookiesAdmin();

        for (const nomZone of ['Part-Dieu', 'Confluence']) {
            await request(serveur)
                .post('/api/admin/zones')
                .set('Cookie', cookies)
                .send({ nomZone, couleur: 'Vert', points: TRACE })
                .expect(201);
        }

        expect(await t.prisma.zone.count({ where: { couleur: 'Vert' } })).toBe(
            2,
        );
    });

    it('CA11 — ne modifie aucun créneau ni aucune intervention quand la couleur change [RG5]', async () => {
        const zone = await creerZone(t.prisma, { couleur: 'Rouge' });
        const intervention = await creerIntervention(t.prisma);
        const creneau = await creerCreneau(t.prisma, {
            technicienId: intervention.technicienId,
            zoneId: zone.id,
            statut: 'InterventionReservee',
            interventionId: intervention.id,
        });
        const creneauAvant = await t.prisma.creneau.findUniqueOrThrow({
            where: { id: creneau.id },
        });
        const interventionAvant = await t.prisma.intervention.findUniqueOrThrow(
            { where: { id: intervention.id } },
        );

        await request(serveur)
            .patch(`/api/admin/zones/${zone.id}`)
            .set('Cookie', await cookiesAdmin())
            .send({ couleur: 'Bleu' })
            .expect(200);

        expect(
            await t.prisma.creneau.findUniqueOrThrow({
                where: { id: creneau.id },
            }),
        ).toEqual(creneauAvant);
        expect(
            await t.prisma.intervention.findUniqueOrThrow({
                where: { id: intervention.id },
            }),
        ).toEqual(interventionAvant);
    });
});

// Écart du 17/11/2026 (CA13, CA14) : l'affichage en gris se vérifie à la main.
// Ce test prouve seulement la moitié backend : la couleur enregistrée survit à
// la désactivation puis à la réactivation. Il ne porte pas de numéro CAnn.
describe("Couleur d'une zone — désactivation et réactivation", () => {
    let t: ApplicationDeTest;

    beforeAll(async () => {
        t = await creerApplicationDeTest();
    });

    beforeEach(async () => {
        await viderLaBase(t.prisma);
    });

    afterAll(async () => {
        await t.app.close();
    });

    it('conserve la couleur enregistrée d’une zone désactivée puis réactivée', async () => {
        const serveur = t.app.getHttpServer() as Server;
        const zone = await creerZone(t.prisma, { couleur: 'Indigo' });
        const cookies = await seConnecter(
            t.app,
            await creerUtilisateur(t.prisma, 'admin'),
        );

        for (const isActive of [false, true]) {
            const reponse = await request(serveur)
                .patch(`/api/admin/zones/${zone.id}`)
                .set('Cookie', cookies)
                .send({ isActive })
                .expect(200);
            expect((reponse.body as { couleur: string }).couleur).toBe(
                'Indigo',
            );
        }
    });
});
