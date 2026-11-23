import type { Server } from 'http';
import request from 'supertest';
import {
    creerApplicationDeTest,
    ApplicationDeTest,
} from './helpers/application';
import { viderLaBase } from './helpers/base';
import {
    creerAffectation,
    creerModele,
    creerUtilisateur,
    creerZone,
} from './helpers/fabriques';
import { seConnecter } from './helpers/connexion';
import { ajouterJours, aujourdHui } from '../src/shared/domain/jour-travail';

// Écran de planification d'un technicien (séquence de l'US-02) :
// - GET  …/planification         : ouverture (demain, zones proposées) ;
// - POST …/planification/apercu  : validation de la saisie, sans écriture.
// Les critères qui dépendent de l'heure (CA04, CA16) et de la cohérence des
// blocs entre eux (CA10, CA11, CA17) sont testés en unitaire. CA19 passe par
// la génération de l'US-03 (écart du 23/11/2026, option A).
type CorpsPlanification = {
    zoneId?: string;
    jours?: string[];
    blocs?: { debut: number; fin: number }[];
    dateDebut?: string;
    dateFin?: string;
};

type ZoneProposee = { id: string; nomZone: string; couleur: string };

describe('US-02 Définir les blocs, la zone, les jours et la période 2.0', () => {
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

    const routeEcran = (technicienId: string) =>
        `/api/admin/planning/techniciens/${technicienId}/planification`;
    const routeApercu = (technicienId: string) =>
        `${routeEcran(technicienId)}/apercu`;

    /** Un admin connecté et un technicien affecté à une zone active. */
    async function preparer() {
        const admin = await creerUtilisateur(t.prisma, 'admin');
        const technicien = await creerUtilisateur(t.prisma, 'technicien');
        const zone = await creerZone(t.prisma);
        await creerAffectation(t.prisma, technicien.id, zone.id);
        return {
            cookies: await seConnecter(t.app, admin),
            technicienId: technicien.id,
            zoneId: zone.id,
        };
    }

    /**
     * Une planification valide : la semaine qui commence dans deux jours
     * (toujours après demain, quelle que soit l'heure du test), lundi et
     * mercredi, 8h00–12h00 et 14h00–18h00. À surcharger champ par champ.
     */
    function corpsValide(zoneId: string, surcharge: CorpsPlanification = {}) {
        const debut = ajouterJours(aujourdHui(), 2);
        return {
            zoneId,
            jours: ['lundi', 'mercredi'],
            blocs: [
                { debut: 480, fin: 720 },
                { debut: 840, fin: 1080 },
            ],
            dateDebut: debut,
            dateFin: ajouterJours(debut, 6),
            ...surcharge,
        };
    }

    it('CA01 — refuse l’accès à un utilisateur sans le rôle admin [RG1]', async () => {
        const { technicienId, zoneId } = await preparer();

        for (const role of ['client', 'technicien'] as const) {
            const cookies = await seConnecter(
                t.app,
                await creerUtilisateur(t.prisma, role),
            );
            await request(serveur)
                .get(routeEcran(technicienId))
                .set('Cookie', cookies)
                .expect(403);
            await request(serveur)
                .post(routeApercu(technicienId))
                .set('Cookie', cookies)
                .send(corpsValide(zoneId))
                .expect(403);
        }
    });

    it('CA02 — répond « introuvable » quand le technicien n’existe pas [—]', async () => {
        const { cookies, zoneId } = await preparer();
        const client = await creerUtilisateur(t.prisma, 'client');

        // Un id inconnu, ou celui d'un utilisateur qui n'est pas technicien
        for (const id of ['00000000-0000-4000-8000-000000000000', client.id]) {
            await request(serveur)
                .get(routeEcran(id))
                .set('Cookie', cookies)
                .expect(404);
            await request(serveur)
                .post(routeApercu(id))
                .set('Cookie', cookies)
                .send(corpsValide(zoneId))
                .expect(404);
        }
    });

    it('CA08 — refuse un bloc hors de 7h00–20h00 [RG2]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();

        // 6h30–8h00 commence trop tôt ; 18h00–20h30 finit trop tard
        for (const bloc of [
            { debut: 390, fin: 480 },
            { debut: 1080, fin: 1230 },
        ]) {
            await request(serveur)
                .post(routeApercu(technicienId))
                .set('Cookie', cookies)
                .send(corpsValide(zoneId, { blocs: [bloc] }))
                .expect(400);
        }
    });

    it('CA09 — refuse un bloc dont le début ou la fin n’est pas un multiple de 30 min [RG2]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();

        // 8h15–10h00 : début hors pas ; 8h00–10h10 : fin hors pas
        for (const bloc of [
            { debut: 495, fin: 600 },
            { debut: 480, fin: 610 },
        ]) {
            await request(serveur)
                .post(routeApercu(technicienId))
                .set('Cookie', cookies)
                .send(corpsValide(zoneId, { blocs: [bloc] }))
                .expect(400);
        }
    });

    it('CA12 — refuse une planification sans bloc [RG2]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();

        await request(serveur)
            .post(routeApercu(technicienId))
            .set('Cookie', cookies)
            .send(corpsValide(zoneId, { blocs: [] }))
            .expect(400);
    });

    it('CA13 — ne propose que les zones affectées au technicien et actives [RG4, RG5]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();
        // Affectée mais inactive : écartée
        const inactive = await creerZone(t.prisma, { isActive: false });
        await creerAffectation(t.prisma, technicienId, inactive.id);
        // Active mais affectée à un autre technicien : écartée
        const autre = await creerUtilisateur(t.prisma, 'technicien');
        const zoneAutre = await creerZone(t.prisma);
        await creerAffectation(t.prisma, autre.id, zoneAutre.id);

        const reponse = await request(serveur)
            .get(routeEcran(technicienId))
            .set('Cookie', cookies)
            .expect(200);

        const { zones } = reponse.body as { zones: ZoneProposee[] };
        expect(zones.map((z) => z.id)).toEqual([zoneId]);
    });

    it('CA14 — refuse une zone non affectée ou inactive transmise au serveur [RG4, RG5]', async () => {
        const { cookies, technicienId } = await preparer();
        const nonAffectee = await creerZone(t.prisma);
        const inactive = await creerZone(t.prisma, { isActive: false });
        await creerAffectation(t.prisma, technicienId, inactive.id);

        for (const zone of [nonAffectee, inactive]) {
            await request(serveur)
                .post(routeApercu(technicienId))
                .set('Cookie', cookies)
                .send(corpsValide(zone.id))
                .expect(400);
        }
    });

    it('CA15 — refuse une planification sans jour de semaine [RG6]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();

        await request(serveur)
            .post(routeApercu(technicienId))
            .set('Cookie', cookies)
            .send(corpsValide(zoneId, { jours: [] }))
            .expect(400);
    });

    it('CA18 — refuse une date de début ou de fin absente [RG6]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();

        for (const manque of ['dateDebut', 'dateFin'] as const) {
            const corps = corpsValide(zoneId);
            delete corps[manque];
            await request(serveur)
                .post(routeApercu(technicienId))
                .set('Cookie', cookies)
                .send(corps)
                .expect(400);
        }
        // Le cas valide passe : ce sont bien les dates absentes qui étaient
        // refusées, pas le reste de la saisie
        await request(serveur)
            .post(routeApercu(technicienId))
            .set('Cookie', cookies)
            .send(corpsValide(zoneId))
            .expect(200);
    });

    it('CA19 — génère des créneaux avec les valeurs ajustées d’un modèle sans modifier le modèle [RG12]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();
        const modele = await creerModele(t.prisma, {
            technicienId,
            zoneId,
            intitule: 'Semaine matin',
        });
        const avant = await t.prisma.modelePlanification.findUniqueOrThrow({
            where: { id: modele.id },
            include: { blocs: true },
        });

        // Le modèle (lundi, 8h00–12h00) ajusté pour cette planification :
        // lundi et mercredi, deux blocs. La génération ne reçoit que les
        // valeurs, jamais le modèle.
        await request(serveur)
            .post(routeEcran(technicienId))
            .set('Cookie', cookies)
            .send(corpsValide(zoneId))
            .expect(201);

        expect(await t.prisma.creneau.count()).toBeGreaterThan(0);
        expect(
            await t.prisma.modelePlanification.findUniqueOrThrow({
                where: { id: modele.id },
                include: { blocs: true },
            }),
        ).toEqual(avant);
    });

    it('CA20 — enregistre les valeurs ajustées dans le modèle par « Modifier le modèle », sans confirmation [RG12]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();
        const modele = await creerModele(t.prisma, {
            technicienId,
            zoneId,
            intitule: 'Semaine matin',
        });

        // L'écran de planification envoie les valeurs ajustées par la route
        // de modification d'un modèle ; une seule requête suffit (aucune étape
        // de confirmation côté serveur)
        await request(serveur)
            .put(
                `/api/admin/planning/techniciens/${technicienId}/modeles/${modele.id}`,
            )
            .set('Cookie', cookies)
            .send({
                intitule: 'Semaine matin',
                zoneId,
                jours: ['mardi'],
                blocs: [{ debut: 540, fin: 660 }],
            })
            .expect(200);

        const relu = await t.prisma.modelePlanification.findUniqueOrThrow({
            where: { id: modele.id },
            include: { blocs: { select: { debut: true, fin: true } } },
        });
        expect([relu.lundi, relu.mardi]).toEqual([false, true]);
        expect(relu.blocs).toEqual([{ debut: 540, fin: 660 }]);
    });
});
