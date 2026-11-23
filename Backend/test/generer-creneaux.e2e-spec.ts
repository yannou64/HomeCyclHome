import type { Server } from 'http';
import request from 'supertest';
import {
    creerApplicationDeTest,
    ApplicationDeTest,
} from './helpers/application';
import { viderLaBase } from './helpers/base';
import {
    creerAffectation,
    creerBlocReserve,
    creerCreneau,
    creerIntervention,
    creerUtilisateur,
    creerZone,
} from './helpers/fabriques';
import { seConnecter } from './helpers/connexion';
import {
    ajouterJours,
    aujourdHui,
    instantDuJour,
    jourTravail,
    minutesDuJour,
    type JourCalendaire,
} from '../src/shared/domain/jour-travail';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../src/features/planning/repositories/planning.repository.interface';

// Génération des créneaux (séquence de l'US-03) :
// - POST …/planification/apercu : les nombres de l'avertissement, sans écrire ;
// - POST …/planification        : la génération ; refusée (409) sans
//   « confirmation » quand la période a déjà des créneaux.
// Le calcul des jours et des horaires (CA09, CA19) est testé en unitaire.

const JOURS = [
    'dimanche',
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
] as const;

describe('US-03 Générer les créneaux et réinitialiser la période 2.0', () => {
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

    // La période des tests : 7 jours qui commencent dans 3 jours (toujours
    // après demain, quelle que soit l'heure du test)
    const DEBUT: JourCalendaire = ajouterJours(aujourdHui(), 3);
    const FIN: JourCalendaire = ajouterJours(DEBUT, 6);

    /** Nom du jour de semaine d'un jour de Paris : 'lundi'… */
    function nomDuJour(jour: JourCalendaire) {
        // Midi à Paris : jamais à cheval sur deux jours
        const nom = instantDuJour(jour, 720).toLocaleDateString('fr-FR', {
            weekday: 'long',
            timeZone: 'Europe/Paris',
        });
        return JOURS.find((j) => j === nom) ?? 'lundi';
    }

    /** Un admin connecté et un technicien affecté à une zone active. */
    async function preparer() {
        const admin = await creerUtilisateur(t.prisma, 'admin');
        const technicien = await creerUtilisateur(t.prisma, 'technicien');
        const zone = await creerZone(t.prisma);
        await creerAffectation(t.prisma, technicien.id, zone.id);
        const route = `/api/admin/planning/techniciens/${technicien.id}/planification`;
        return {
            cookies: await seConnecter(t.app, admin),
            technicienId: technicien.id,
            zoneId: zone.id,
            route,
            routeApercu: `${route}/apercu`,
        };
    }

    /** Planification valide : tous les jours de la période, 8h00–12h00. */
    function corps(
        zoneId: string,
        surcharge: Record<string, unknown> = {},
    ): Record<string, unknown> {
        return {
            zoneId,
            jours: [...JOURS],
            blocs: [{ debut: 480, fin: 720 }],
            dateDebut: DEBUT,
            dateFin: FIN,
            ...surcharge,
        };
    }

    /** Créneaux du technicien, triés, avec leur jour et leur heure à Paris. */
    async function creneauxDe(technicienId: string) {
        const lignes = await t.prisma.creneau.findMany({
            where: { technicien_id: technicienId },
            orderBy: { date_debut: 'asc' },
        });
        return lignes.map((c) => ({
            ...c,
            jour: jourTravail(c.date_debut),
            minutes: minutesDuJour(c.date_debut),
        }));
    }

    /** Une journée pleine de créneaux Libres, 7h00–20h00 (26 créneaux). */
    async function journeePleine(
        technicienId: string,
        zoneId: string,
        jour: JourCalendaire,
    ) {
        for (let m = 420; m < 1200; m += 30) {
            await creerCreneau(t.prisma, {
                technicienId,
                zoneId,
                dateDebut: instantDuJour(jour, m),
            });
        }
    }

    it('CA01 — refuse la génération à un utilisateur sans le rôle admin [RG1]', async () => {
        const { route, zoneId } = await preparer();

        for (const role of ['client', 'technicien'] as const) {
            const cookies = await seConnecter(
                t.app,
                await creerUtilisateur(t.prisma, role),
            );
            await request(serveur)
                .post(route)
                .set('Cookie', cookies)
                .send(corps(zoneId, { confirmation: true }))
                .expect(403);
        }
        expect(await t.prisma.creneau.count()).toBe(0);
    });

    it('CA02 — refuse une planification invalide sans rien modifier [—]', async () => {
        const { cookies, route, technicienId, zoneId } = await preparer();
        await journeePleine(technicienId, zoneId, DEBUT);
        const avant = await creneauxDe(technicienId);
        const nonAffectee = await creerZone(t.prisma);

        // Zone non affectée, puis aucun bloc : refus, même confirmé
        for (const surcharge of [{ zoneId: nonAffectee.id }, { blocs: [] }]) {
            await request(serveur)
                .post(route)
                .set('Cookie', cookies)
                .send(corps(zoneId, { ...surcharge, confirmation: true }))
                .expect(400);
        }
        expect(await creneauxDe(technicienId)).toEqual(avant);
    });

    it('CA03 — crée les créneaux sans avertissement quand la période est vide [RG10]', async () => {
        const { cookies, route, routeApercu, technicienId, zoneId } =
            await preparer();

        // L'aperçu n'annonce rien à remplacer
        const apercu = await request(serveur)
            .post(routeApercu)
            .set('Cookie', cookies)
            .send(corps(zoneId))
            .expect(200);
        expect(apercu.body).toEqual({
            creneauxSupprimes: 0,
            interventionsTouchees: 0,
        });

        // La génération passe sans confirmation : 7 jours × 8 créneaux
        const reponse = await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corps(zoneId))
            .expect(201);
        expect(reponse.body).toMatchObject({ creneauxCrees: 56 });
        expect(await creneauxDe(technicienId)).toHaveLength(56);
    });

    it('CA04 — annonce la réinitialisation avec le nombre de créneaux supprimés et d’interventions touchées [RG10]', async () => {
        const { cookies, routeApercu, technicienId, zoneId } = await preparer();
        // Deux interventions dans la période (une Planifiée, une En conflit),
        // chacune avec un bloc de 4 créneaux, et 2 créneaux Libres
        for (const [statut, debut] of [
            ['Planifiee', 480],
            ['EnConflit', 720],
        ] as const) {
            const intervention = await creerIntervention(t.prisma, {
                technicienId,
                statut,
            });
            await creerBlocReserve(t.prisma, {
                technicienId,
                zoneId,
                interventionId: intervention.id,
                jour: DEBUT,
                debut,
            });
        }
        for (const m of [900, 930]) {
            await creerCreneau(t.prisma, {
                technicienId,
                zoneId,
                dateDebut: instantDuJour(FIN, m),
            });
        }
        // Hors période (le lendemain de la fin) : pas compté
        await creerCreneau(t.prisma, {
            technicienId,
            zoneId,
            dateDebut: instantDuJour(ajouterJours(FIN, 1), 480),
        });

        const reponse = await request(serveur)
            .post(routeApercu)
            .set('Cookie', cookies)
            .send(corps(zoneId))
            .expect(200);

        // Toutes les interventions qui ont un créneau dans la période, quel
        // que soit leur statut (écart du 23/11/2026)
        expect(reponse.body).toEqual({
            creneauxSupprimes: 10,
            interventionsTouchees: 2,
        });
    });

    it('CA05 — ne modifie rien quand l’admin annule l’avertissement [RG10]', async () => {
        const { cookies, route, routeApercu, technicienId, zoneId } =
            await preparer();
        await journeePleine(technicienId, zoneId, DEBUT);
        const avant = await creneauxDe(technicienId);

        // L'avertissement ne modifie rien…
        await request(serveur)
            .post(routeApercu)
            .set('Cookie', cookies)
            .send(corps(zoneId))
            .expect(200);
        // … et sans confirmation, le serveur refuse de remplacer (garde de
        // RG10 : rien n'est appliqué sans confirmation)
        const refus = await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corps(zoneId))
            .expect(409);
        expect(refus.body).toMatchObject({
            creneauxSupprimes: 26,
            interventionsTouchees: 0,
        });

        expect(await creneauxDe(technicienId)).toEqual(avant);
    });

    it('CA06 — supprime tous les créneaux de la période à la confirmation, jours non choisis compris [RG9, RG10]', async () => {
        const { cookies, route, technicienId, zoneId } = await preparer();
        // Un créneau chaque jour de la période, à 15h00
        for (let i = 0; i < 7; i++) {
            await creerCreneau(t.prisma, {
                technicienId,
                zoneId,
                dateDebut: instantDuJour(ajouterJours(DEBUT, i), 900),
            });
        }
        const jourChoisi = nomDuJour(DEBUT);

        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corps(zoneId, { jours: [jourChoisi], confirmation: true }))
            .expect(201);

        // Plus aucun créneau à 15h00, même les jours non choisis : seuls
        // restent les 8 nouveaux créneaux du jour choisi
        const apres = await creneauxDe(technicienId);
        expect(apres.some((c) => c.minutes === 900)).toBe(false);
        expect(apres).toHaveLength(8);
        expect(new Set(apres.map((c) => c.jour))).toEqual(new Set([DEBUT]));
    });

    it('CA07 — ne garde que les créneaux de la matinée d’une journée prévue en entier puis replanifiée sur la matinée [RG9]', async () => {
        const { cookies, route, technicienId, zoneId } = await preparer();
        await journeePleine(technicienId, zoneId, DEBUT);

        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(
                corps(zoneId, {
                    dateFin: DEBUT,
                    jours: [nomDuJour(DEBUT)],
                    confirmation: true,
                }),
            )
            .expect(201);

        // 8h00, 8h30 … 11h30 : la matinée seule
        const apres = await creneauxDe(technicienId);
        expect(apres.map((c) => c.minutes)).toEqual([
            480, 510, 540, 570, 600, 630, 660, 690,
        ]);
    });

    it('CA08 — crée des créneaux de 30 min, Libres, avec le technicien et la zone choisis [RG7]', async () => {
        const { cookies, route, technicienId, zoneId } = await preparer();

        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(
                corps(zoneId, {
                    dateFin: DEBUT,
                    blocs: [
                        { debut: 480, fin: 600 },
                        { debut: 840, fin: 930 },
                    ],
                }),
            )
            .expect(201);

        const apres = await creneauxDe(technicienId);
        // Un créneau toutes les 30 minutes dans chaque bloc
        expect(apres.map((c) => c.minutes)).toEqual([
            480, 510, 540, 570, 840, 870, 900,
        ]);
        for (const c of apres) {
            expect(c.statut).toBe('Libre');
            expect(c.technicien_id).toBe(technicienId);
            expect(c.zone_id).toBe(zoneId);
            expect(c.intervention_id).toBeNull();
        }
    });

    it('CA10 — supprime tout le bloc d’un créneau réservé et passe l’intervention Planifiée en conflit, date, heure et technicien conservés [RG11]', async () => {
        const { cookies, route, technicienId, zoneId } = await preparer();
        const intervention = await creerIntervention(t.prisma, {
            technicienId,
        });
        const avant = await t.prisma.intervention.findUniqueOrThrow({
            where: { id: intervention.id },
        });
        const bloc = await creerBlocReserve(t.prisma, {
            technicienId,
            zoneId,
            interventionId: intervention.id,
            jour: DEBUT,
            debut: 840,
        });

        // Nouvelle planification sur la seule matinée : le bloc de l'après-
        // midi ne serait pas recréé, il est supprimé en entier
        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corps(zoneId, { confirmation: true }))
            .expect(201);

        expect(
            await t.prisma.creneau.count({ where: { id: { in: bloc } } }),
        ).toBe(0);
        const apres = await t.prisma.intervention.findUniqueOrThrow({
            where: { id: intervention.id },
        });
        expect(apres.statut).toBe('EnConflit');
        expect(apres.date_prevue).toEqual(avant.date_prevue);
        expect(apres.technicien_id).toBe(avant.technicien_id);
        expect(apres.duree_minutes_snapshot).toBe(avant.duree_minutes_snapshot);
    });

    it('CA11 — supprime le créneau d’une intervention déjà En conflit sans changer son statut [RG11]', async () => {
        const { cookies, route, technicienId, zoneId } = await preparer();
        const intervention = await creerIntervention(t.prisma, {
            technicienId,
            statut: 'EnConflit',
        });
        const bloc = await creerBlocReserve(t.prisma, {
            technicienId,
            zoneId,
            interventionId: intervention.id,
            jour: DEBUT,
            debut: 840,
        });

        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corps(zoneId, { confirmation: true }))
            .expect(201);

        expect(
            await t.prisma.creneau.count({ where: { id: { in: bloc } } }),
        ).toBe(0);
        const apres = await t.prisma.intervention.findUniqueOrThrow({
            where: { id: intervention.id },
        });
        expect(apres.statut).toBe('EnConflit');
        // Elle ne « passe » pas en conflit : aucune trace ajoutée (RG16)
        expect(apres.commentaire_technicien).toBeNull();
    });

    it('CA12 — concatène en tête du commentaire partagé la date, l’heure, « Système » et « planning du technicien réinitialisé par l’admin » [RG16]', async () => {
        const { cookies, route, technicienId, zoneId } = await preparer();
        const intervention = await creerIntervention(t.prisma, {
            technicienId,
        });
        await t.prisma.intervention.update({
            where: { id: intervention.id },
            data: { commentaire_technicien: 'Ancienne note' },
        });
        await creerBlocReserve(t.prisma, {
            technicienId,
            zoneId,
            interventionId: intervention.id,
            jour: DEBUT,
            debut: 480,
        });

        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corps(zoneId, { confirmation: true }))
            .expect(201);

        const { commentaire_technicien } =
            await t.prisma.intervention.findUniqueOrThrow({
                where: { id: intervention.id },
            });
        // « JJ/MM/AAAA HH:MM — Système : … », en tête, l'ancienne note après.
        // La même transaction est prouvée par CA17 (échec : rien n'est écrit).
        expect(commentaire_technicien).toMatch(
            /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} — Système : planning du technicien réinitialisé par l’admin\nAncienne note$/,
        );
    });

    it('CA13 — laisse inchangée une intervention hors de la période [RG9]', async () => {
        const { cookies, route, technicienId, zoneId } = await preparer();
        const intervention = await creerIntervention(t.prisma, {
            technicienId,
        });
        // Le lendemain de la fin de période
        const bloc = await creerBlocReserve(t.prisma, {
            technicienId,
            zoneId,
            interventionId: intervention.id,
            jour: ajouterJours(FIN, 1),
            debut: 480,
        });
        const avant = await t.prisma.intervention.findUniqueOrThrow({
            where: { id: intervention.id },
        });

        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corps(zoneId, { confirmation: true }))
            .expect(201);

        expect(
            await t.prisma.intervention.findUniqueOrThrow({
                where: { id: intervention.id },
            }),
        ).toEqual(avant);
        expect(
            await t.prisma.creneau.count({ where: { id: { in: bloc } } }),
        ).toBe(4);
    });

    it('CA14 — ne laisse que la zone choisie sur chaque jour de la période [RG8]', async () => {
        const { cookies, route, technicienId, zoneId } = await preparer();
        // Le premier jour était planifié dans une autre zone
        const autreZone = await creerZone(t.prisma);
        await creerAffectation(t.prisma, technicienId, autreZone.id);
        await journeePleine(technicienId, autreZone.id, DEBUT);

        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corps(zoneId, { confirmation: true }))
            .expect(201);

        const apres = await creneauxDe(technicienId);
        expect(new Set(apres.map((c) => c.zone_id))).toEqual(new Set([zoneId]));
    });

    it('CA15 — ne crée aucun modèle pour une planification libre [RG12]', async () => {
        const { cookies, route, zoneId } = await preparer();

        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(corps(zoneId))
            .expect(201);

        expect(await t.prisma.modelePlanification.count()).toBe(0);
        expect(await t.prisma.blocHoraire.count()).toBe(0);
    });

    it('CA16 — enregistre des créneaux sans aucun lien vers un modèle [RG12]', async () => {
        const { cookies, route, technicienId, zoneId } = await preparer();

        // Un identifiant de modèle envoyé quand même est ignoré (whitelist)
        await request(serveur)
            .post(route)
            .set('Cookie', cookies)
            .send(
                corps(zoneId, {
                    modeleId: '00000000-0000-4000-8000-000000000000',
                }),
            )
            .expect(201);

        // Aucune colonne d'un créneau ne désigne un modèle
        const [creneau] = await t.prisma.creneau.findMany({
            where: { technicien_id: technicienId },
            take: 1,
        });
        expect(Object.keys(creneau).some((cle) => /modele/i.test(cle))).toBe(
            false,
        );
    });

    it('CA17 — ne modifie rien quand la génération échoue en cours de route : tout ou rien [—]', async () => {
        const { technicienId, zoneId } = await preparer();
        const intervention = await creerIntervention(t.prisma, {
            technicienId,
        });
        await creerBlocReserve(t.prisma, {
            technicienId,
            zoneId,
            interventionId: intervention.id,
            jour: DEBUT,
            debut: 480,
        });
        const creneauxAvant = await creneauxDe(technicienId);
        const interventionAvant = await t.prisma.intervention.findUniqueOrThrow(
            { where: { id: intervention.id } },
        );
        const repo = t.app.get<IPlanningRepository>(PLANNING_REPO);

        // Appel direct du repository, sans use case : deux nouveaux créneaux
        // au même horaire. L'unicité de la base refuse le second, APRÈS le
        // passage en conflit, la trace et la suppression. Le repository
        // signale l'échec par null (le use case en fera un conflit 409).
        const instant = instantDuJour(DEBUT, 600);
        await expect(
            repo.remplacerCreneaux({
                technicienId,
                zoneId,
                debut: instantDuJour(DEBUT, 0),
                fin: instantDuJour(ajouterJours(FIN, 1), 0),
                nouveaux: [instant, instant],
                entreeConflit: 'entrée de test',
            }),
        ).resolves.toBeNull();

        // Transaction annulée : créneaux, statut et commentaire intacts
        expect(await creneauxDe(technicienId)).toEqual(creneauxAvant);
        expect(
            await t.prisma.intervention.findUniqueOrThrow({
                where: { id: intervention.id },
            }),
        ).toEqual(interventionAvant);
    });

    it('CA20 — refuse en base un second créneau du même technicien au même horaire [RG7]', async () => {
        const { technicienId, zoneId } = await preparer();
        const instant = instantDuJour(DEBUT, 480);
        await creerCreneau(t.prisma, {
            technicienId,
            zoneId,
            dateDebut: instant,
        });

        // Écriture directe, même dans une autre zone : la base refuse
        const autreZone = await creerZone(t.prisma);
        await expect(
            creerCreneau(t.prisma, {
                technicienId,
                zoneId: autreZone.id,
                dateDebut: instant,
            }),
        ).rejects.toThrow();
        expect(
            await t.prisma.creneau.count({
                where: { technicien_id: technicienId },
            }),
        ).toBe(1);
    });
});
