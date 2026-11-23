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
    technicienId?: string; // champ interdit : sert à CA17
};

describe('US-02 Modifier un modèle de planification 2.0', () => {
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
     * Cas nominal : un admin connecté, un technicien affecté à une zone
     * active, et un modèle « Semaine matin » (lundi, 8h00–12h00) dans cette
     * zone. `route` est l'adresse du modèle.
     */
    async function preparer() {
        const admin = await creerUtilisateur(t.prisma, 'admin');
        const technicien = await creerUtilisateur(t.prisma, 'technicien');
        const zone = await creerZone(t.prisma);
        await creerAffectation(t.prisma, technicien.id, zone.id);
        const modele = await creerModele(t.prisma, {
            technicienId: technicien.id,
            zoneId: zone.id,
            intitule: 'Semaine matin',
        });
        return {
            cookies: await seConnecter(t.app, admin),
            technicienId: technicien.id,
            zoneId: zone.id,
            modeleId: modele.id,
            route: `/api/admin/planning/techniciens/${technicien.id}/modeles/${modele.id}`,
        };
    }

    /** Une saisie valide et différente du modèle, à surcharger champ par champ. */
    function corpsValide(zoneId: string, surcharge: CorpsModele = {}) {
        return {
            intitule: 'Semaine après-midi',
            zoneId,
            jours: ['mardi', 'jeudi'],
            blocs: [
                { debut: 840, fin: 960 },
                { debut: 990, fin: 1080 },
            ],
            ...surcharge,
        };
    }

    /** Le modèle relu en base, blocs triés : pour vérifier « rien n'a changé ». */
    function relire(modeleId: string) {
        return t.prisma.modelePlanification.findUniqueOrThrow({
            where: { id: modeleId },
            include: {
                blocs: {
                    orderBy: { debut: 'asc' },
                    select: { debut: true, fin: true },
                },
            },
        });
    }

    /** Vérifie que le modèle est resté tel que `preparer` l'a créé. */
    async function attendreInchange(modeleId: string, zoneId: string) {
        const m = await relire(modeleId);
        expect(m.intitule).toBe('Semaine matin');
        expect(m.zone_id).toBe(zoneId);
        expect(m.lundi).toBe(true);
        expect(m.mardi).toBe(false);
        expect(m.blocs).toEqual([{ debut: 480, fin: 720 }]);
    }

    it('CA01 — refuse l’accès à un utilisateur sans le rôle admin [RG1]', async () => {
        const { route, zoneId, modeleId } = await preparer();

        for (const role of ['client', 'technicien'] as const) {
            const cookies = await seConnecter(
                t.app,
                await creerUtilisateur(t.prisma, role),
            );
            await request(serveur)
                .get(route)
                .set('Cookie', cookies)
                .expect(403);
            await request(serveur)
                .put(route)
                .set('Cookie', cookies)
                .send(corpsValide(zoneId))
                .expect(403);
        }

        await attendreInchange(modeleId, zoneId);
    });

    it('CA02 — répond « introuvable » pour un modèle inexistant ou d’un autre technicien [RG10]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();

        // Un modèle qui appartient à un autre technicien, même zone
        const autre = await creerUtilisateur(t.prisma, 'technicien');
        await creerAffectation(t.prisma, autre.id, zoneId);
        const modeleAutre = await creerModele(t.prisma, {
            technicienId: autre.id,
            zoneId,
            intitule: 'Modèle de l’autre',
        });

        for (const modeleId of [
            '00000000-0000-4000-8000-000000000000',
            modeleAutre.id,
        ]) {
            const route = `/api/admin/planning/techniciens/${technicienId}/modeles/${modeleId}`;
            await request(serveur)
                .get(route)
                .set('Cookie', cookies)
                .expect(404);
            await request(serveur)
                .put(route)
                .set('Cookie', cookies)
                .send(corpsValide(zoneId))
                .expect(404);
        }

        // Le modèle de l'autre technicien n'a pas été touché
        const m = await relire(modeleAutre.id);
        expect(m.intitule).toBe('Modèle de l’autre');
    });

    it('CA03 — ouvre un modèle valide avec ses valeurs actuelles [RG11]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();
        const modele = await creerModele(t.prisma, {
            technicienId,
            zoneId,
            intitule: 'Deux blocs',
            jours: ['lundi', 'vendredi'],
            // Écrits dans le désordre : la réponse les trie par début
            blocs: [
                { debut: 840, fin: 960 },
                { debut: 480, fin: 720 },
            ],
        });

        const reponse = await request(serveur)
            .get(
                `/api/admin/planning/techniciens/${technicienId}/modeles/${modele.id}`,
            )
            .set('Cookie', cookies)
            .expect(200);

        expect(reponse.body).toEqual({
            id: modele.id,
            intitule: 'Deux blocs',
            technicienId,
            zoneId,
            jours: ['lundi', 'vendredi'],
            blocs: [
                { debut: 480, fin: 720 },
                { debut: 840, fin: 960 },
            ],
            valide: true,
        });
    });

    it('CA05 — refuse la modification d’un modèle invalide [RG11]', async () => {
        const { cookies, technicienId, zoneId, modeleId, route } =
            await preparer();
        // Une autre zone, affectée et active : même vers elle, la modification
        // d'un modèle invalide est refusée (on le supprime et on en recrée un)
        const zoneValide = await creerZone(t.prisma);
        await creerAffectation(t.prisma, technicienId, zoneValide.id);

        // Invalide 1 : la zone du modèle n'est plus affectée au technicien
        await t.prisma.technicienZone.deleteMany({
            where: { technicien_id: technicienId, zone_id: zoneId },
        });
        await request(serveur)
            .put(route)
            .set('Cookie', cookies)
            .send(corpsValide(zoneValide.id))
            .expect(409);
        await attendreInchange(modeleId, zoneId);

        // Invalide 2 : la zone est réaffectée mais devenue inactive
        await creerAffectation(t.prisma, technicienId, zoneId);
        await t.prisma.zone.update({
            where: { id: zoneId },
            data: { is_active: false },
        });
        await request(serveur)
            .put(route)
            .set('Cookie', cookies)
            .send(corpsValide(zoneValide.id))
            .expect(409);
        await attendreInchange(modeleId, zoneId);
    });

    it('CA07 — refuse un intitulé vide ou de plus de 100 caractères [RG3]', async () => {
        const { cookies, zoneId, modeleId, route } = await preparer();

        for (const intitule of ['', '   ', 'x'.repeat(101)]) {
            await request(serveur)
                .put(route)
                .set('Cookie', cookies)
                .send(corpsValide(zoneId, { intitule }))
                .expect(400);
        }

        await attendreInchange(modeleId, zoneId);
    });

    it('CA08 — refuse un intitulé déjà pris par un autre modèle du technicien, casse et espaces ignorés [RG3]', async () => {
        const { cookies, technicienId, zoneId, modeleId, route } =
            await preparer();
        await creerModele(t.prisma, {
            technicienId,
            zoneId,
            intitule: 'Week-end',
        });

        for (const intitule of ['Week-end', '  week-END  ']) {
            await request(serveur)
                .put(route)
                .set('Cookie', cookies)
                .send(corpsValide(zoneId, { intitule }))
                .expect(409);
        }

        await attendreInchange(modeleId, zoneId);
    });

    it('CA09 — ne prend pas l’intitulé inchangé du modèle pour un doublon [RG3]', async () => {
        const { cookies, zoneId, modeleId, route } = await preparer();

        // Même intitulé, puis le même à la casse près : le modèle ne se
        // compare pas à lui-même
        for (const intitule of ['Semaine matin', 'Semaine Matin']) {
            await request(serveur)
                .put(route)
                .set('Cookie', cookies)
                .send(corpsValide(zoneId, { intitule }))
                .expect(200);
        }

        expect((await relire(modeleId)).intitule).toBe('Semaine Matin');
    });

    it('CA10 — refuse un bloc hors 7h00–20h00, hors pas de 30 min ou dont la fin n’est pas après le début [RG4]', async () => {
        const { cookies, zoneId, modeleId, route } = await preparer();

        const blocsRefuses = [
            { debut: 390, fin: 480 }, // commence à 6h30
            { debut: 1140, fin: 1230 }, // finit à 20h30
            { debut: 495, fin: 600 }, // 8h15 : hors pas
            { debut: 480, fin: 615 }, // 10h15 : hors pas
            { debut: 600, fin: 600 }, // fin = début
            { debut: 720, fin: 600 }, // fin avant début
        ];
        for (const bloc of blocsRefuses) {
            await request(serveur)
                .put(route)
                .set('Cookie', cookies)
                .send(corpsValide(zoneId, { blocs: [bloc] }))
                .expect(400);
        }

        await attendreInchange(modeleId, zoneId);
    });

    it('CA12 — refuse un modèle sans bloc [RG4]', async () => {
        const { cookies, zoneId, modeleId, route } = await preparer();

        await request(serveur)
            .put(route)
            .set('Cookie', cookies)
            .send(corpsValide(zoneId, { blocs: [] }))
            .expect(400);

        await attendreInchange(modeleId, zoneId);
    });

    it('CA13 — refuse une zone non affectée au technicien ou inactive [RG5]', async () => {
        const { cookies, technicienId, zoneId, modeleId, route } =
            await preparer();
        const nonAffectee = await creerZone(t.prisma);
        const inactive = await creerZone(t.prisma, { isActive: false });
        await creerAffectation(t.prisma, technicienId, inactive.id);

        for (const zone of [nonAffectee, inactive]) {
            await request(serveur)
                .put(route)
                .set('Cookie', cookies)
                .send(corpsValide(zone.id))
                .expect(400);
        }

        await attendreInchange(modeleId, zoneId);
    });

    it('CA14 — refuse un modèle sans jour de semaine [RG6]', async () => {
        const { cookies, zoneId, modeleId, route } = await preparer();

        await request(serveur)
            .put(route)
            .set('Cookie', cookies)
            .send(corpsValide(zoneId, { jours: [] }))
            .expect(400);

        await attendreInchange(modeleId, zoneId);
    });

    it('CA15 — enregistre immédiatement une saisie valide [RG8]', async () => {
        const { cookies, technicienId, modeleId, route } = await preparer();
        const autreZone = await creerZone(t.prisma);
        await creerAffectation(t.prisma, technicienId, autreZone.id);

        // Une seule requête suffit : aucune étape de confirmation côté serveur
        const reponse = await request(serveur)
            .put(route)
            .set('Cookie', cookies)
            .send(corpsValide(autreZone.id, { intitule: '  Semaine soir  ' }))
            .expect(200);

        expect(reponse.body).toEqual({
            id: modeleId,
            intitule: 'Semaine soir',
            technicienId,
            zoneId: autreZone.id,
            jours: ['mardi', 'jeudi'],
            blocs: [
                { debut: 840, fin: 960 },
                { debut: 990, fin: 1080 },
            ],
        });

        // Relu en base : tout est remplacé, l'ancien bloc 8h–12h a disparu
        const m = await relire(modeleId);
        expect(m.intitule).toBe('Semaine soir');
        expect(m.zone_id).toBe(autreZone.id);
        expect([m.lundi, m.mardi, m.jeudi]).toEqual([false, true, true]);
        expect(m.blocs).toEqual([
            { debut: 840, fin: 960 },
            { debut: 990, fin: 1080 },
        ]);
        expect(await t.prisma.blocHoraire.count()).toBe(2);
    });

    // Reporté en S3 (écart du 22/11/2026, option A) : le bouton « Modifier le
    // modèle » de l'écran de planification (« Planifier un technicien 2.0 »)
    // envoie les valeurs ajustées à cette même route PUT.
    it('CA16 — fait passer les valeurs ajustées depuis l’écran de planification par les mêmes validations et le même enregistrement [RG8]', async () => {
        const { cookies, zoneId, modeleId, route } = await preparer();

        // Valeurs ajustées invalides (deux blocs qui se chevauchent) : même
        // refus qu'une modification ordinaire, le modèle ne change pas
        await request(serveur)
            .put(route)
            .set('Cookie', cookies)
            .send(
                corpsValide(zoneId, {
                    intitule: 'Semaine matin',
                    blocs: [
                        { debut: 480, fin: 720 },
                        { debut: 600, fin: 780 },
                    ],
                }),
            )
            .expect(400);
        await attendreInchange(modeleId, zoneId);

        // Valeurs ajustées valides, intitulé inchangé (l'écran de
        // planification renvoie celui du modèle) : enregistrées
        await request(serveur)
            .put(route)
            .set('Cookie', cookies)
            .send(corpsValide(zoneId, { intitule: 'Semaine matin' }))
            .expect(200);
        const m = await relire(modeleId);
        expect(m.intitule).toBe('Semaine matin');
        expect([m.lundi, m.mardi, m.jeudi]).toEqual([false, true, true]);
        expect(m.blocs).toEqual([
            { debut: 840, fin: 960 },
            { debut: 990, fin: 1080 },
        ]);
    });

    it('CA17 — ne change ni le technicien du modèle ni les créneaux existants [RG2, RG7]', async () => {
        const { cookies, technicienId, zoneId, modeleId, route } =
            await preparer();
        const creneau = await creerCreneau(t.prisma, { technicienId, zoneId });
        const avant = await t.prisma.creneau.findMany({
            orderBy: { id: 'asc' },
        });
        const autreTechnicien = await creerUtilisateur(t.prisma, 'technicien');

        // Un technicien glissé dans le corps est ignoré (le DTO ne le connaît pas)
        await request(serveur)
            .put(route)
            .set('Cookie', cookies)
            .send(corpsValide(zoneId, { technicienId: autreTechnicien.id }))
            .expect(200);

        expect((await relire(modeleId)).technicien_id).toBe(technicienId);
        const apres = await t.prisma.creneau.findMany({
            orderBy: { id: 'asc' },
        });
        expect(apres).toEqual(avant);
        expect(apres.map((c) => c.id)).toEqual([creneau.id]);
    });

    it('CA19 — ne modifie rien quand une écriture échoue : tout ou rien [—]', async () => {
        const { technicienId, zoneId, modeleId } = await preparer();
        const repo = t.app.get<IPlanningRepository>(PLANNING_REPO);

        // Appel direct du repository, sans DTO ni use case : le second bloc
        // (fin avant début) est refusé par la contrainte CHECK de la base,
        // APRÈS la mise à jour du modèle et la suppression des anciens blocs
        await expect(
            repo.modifierModele(technicienId, modeleId, {
                zoneId,
                intitule: 'Échec en cours de route',
                jours: ['mardi'],
                blocs: [
                    { debut: 840, fin: 960 },
                    { debut: 1080, fin: 1020 },
                ],
            }),
        ).rejects.toThrow();

        // La transaction a été annulée : le modèle et son bloc d'origine
        await attendreInchange(modeleId, zoneId);
        expect(await t.prisma.blocHoraire.count()).toBe(1);
    });
});
