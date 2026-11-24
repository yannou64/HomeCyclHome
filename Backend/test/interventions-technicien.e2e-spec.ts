import type { Server } from 'http';
import request from 'supertest';
import {
    creerApplicationDeTest,
    ApplicationDeTest,
} from './helpers/application';
import { viderLaBase } from './helpers/base';
import {
    creerAdresseDe,
    creerBlocReserve,
    creerIntervention,
    creerUtilisateur,
    creerZone,
} from './helpers/fabriques';
import { seConnecter } from './helpers/connexion';
import type { StatutIntervention } from '../src/generated/prisma/client';

// Interventions du jour sur la page d'un technicien (séquence de l'US-02) :
// GET …/techniciens/:id/interventions?date=. La liste part des créneaux
// réservés du technicien ce jour-là (jour de Paris) : une intervention sans
// créneau n'y figure pas (RG4). Les heures sont en minutes d'horloge à Paris.

type InterventionDuJour = {
    id: string;
    statut: string;
    debut: number;
    fin: number;
    forfait: string;
    client: { prenom: string; nom: string; telephone: string; email: string };
    cycle: { marque: string; type: string };
    adresse: { rue: string; codePostal: string; ville: string };
};

const JOUR = '2026-06-11';

// Guillemets doubles : le nom exact de l'US contient une apostrophe droite
describe("US-02 Consulter les interventions d'un technicien 2.0", () => {
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

    const route = (id: string) =>
        `/api/admin/planning/techniciens/${id}/interventions`;

    /** Un admin connecté, un technicien et une zone. */
    async function preparer() {
        const admin = await creerUtilisateur(t.prisma, 'admin');
        const technicien = await creerUtilisateur(t.prisma, 'technicien');
        const zone = await creerZone(t.prisma);
        return {
            cookies: await seConnecter(t.app, admin),
            technicienId: technicien.id,
            zoneId: zone.id,
        };
    }

    /**
     * Une intervention du technicien, avec son bloc réservé un jour donné
     * (`debut` en minutes d'horloge, 2 créneaux réservés par défaut).
     */
    async function interventionAvecBloc(
        technicienId: string,
        zoneId: string,
        options: {
            jour?: string;
            debut?: number;
            statut?: StatutIntervention;
        } = {},
    ) {
        const intervention = await creerIntervention(t.prisma, {
            technicienId,
            statut: options.statut,
        });
        await creerBlocReserve(t.prisma, {
            technicienId,
            zoneId,
            interventionId: intervention.id,
            jour: options.jour ?? JOUR,
            debut: options.debut ?? 480,
        });
        return intervention;
    }

    /** La liste du jour, telle que la page la reçoit. */
    async function liste(
        cookies: string[],
        technicienId: string,
        date = JOUR,
    ): Promise<InterventionDuJour[]> {
        const reponse = await request(serveur)
            .get(route(technicienId))
            .query({ date })
            .set('Cookie', cookies)
            .expect(200);
        return reponse.body as InterventionDuJour[];
    }

    it('CA01 — refuse l’accès à un utilisateur sans le rôle admin [RG1]', async () => {
        const { technicienId } = await preparer();

        for (const role of ['client', 'technicien'] as const) {
            const cookies = await seConnecter(
                t.app,
                await creerUtilisateur(t.prisma, role),
            );
            await request(serveur)
                .get(route(technicienId))
                .query({ date: JOUR })
                .set('Cookie', cookies)
                .expect(403);
        }
    });

    it('CA02 — répond « introuvable » pour un technicien inexistant [—]', async () => {
        const { cookies } = await preparer();
        const client = await creerUtilisateur(t.prisma, 'client');

        for (const id of ['00000000-0000-4000-8000-000000000000', client.id]) {
            await request(serveur)
                .get(route(id))
                .query({ date: JOUR })
                .set('Cookie', cookies)
                .expect(404);
        }
    });

    it('CA03 — liste les interventions de ce technicien et de ce jour [RG4]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();
        const a = await interventionAvecBloc(technicienId, zoneId, {
            debut: 480,
        });
        const b = await interventionAvecBloc(technicienId, zoneId, {
            debut: 840,
        });

        const interventions = await liste(cookies, technicienId);

        expect(interventions.map((i) => i.id).sort()).toEqual(
            [a.id, b.id].sort(),
        );
    });

    it('CA04 — montre le forfait et le client [RG4]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();
        const intervention = await interventionAvecBloc(technicienId, zoneId);
        const attendu = await t.prisma.intervention.findUniqueOrThrow({
            where: { id: intervention.id },
            include: {
                client: true,
                historique_prix: { include: { forfait: true } },
            },
        });

        const [i] = await liste(cookies, technicienId);

        expect(i.forfait).toBe(attendu.historique_prix.forfait.nom);
        expect(i.client).toMatchObject({
            prenom: attendu.client.prenom,
            nom: attendu.client.nom,
        });
    });

    it('CA05 — décrit le cycle par sa marque et son type, pas par son libellé [RG4]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();
        const intervention = await interventionAvecBloc(technicienId, zoneId);
        const { cycle } = await t.prisma.intervention.findUniqueOrThrow({
            where: { id: intervention.id },
            include: { cycle: { include: { marque: true, type_cycle: true } } },
        });

        const [i] = await liste(cookies, technicienId);

        expect(i.cycle).toEqual({
            marque: cycle.marque.libelle,
            type: cycle.type_cycle.libelle,
        });
        // Le libellé choisi par le client (« Vélo de test ») n'est pas montré
        expect(JSON.stringify(i)).not.toContain(cycle.libelle);
    });

    it('CA06 — montre le téléphone et l’e-mail du client [RG4]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();
        const intervention = await interventionAvecBloc(technicienId, zoneId);
        const { client } = await t.prisma.intervention.findUniqueOrThrow({
            where: { id: intervention.id },
            include: { client: true },
        });

        const [i] = await liste(cookies, technicienId);

        expect(i.client).toMatchObject({
            telephone: client.telephone,
            email: client.email,
        });
    });

    it('CA07 — montre l’adresse de l’intervention, pas une autre adresse du client [RG4]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();
        const intervention = await interventionAvecBloc(technicienId, zoneId);
        // Une seconde adresse du client, créée après celle de l'intervention
        const autre = await creerAdresseDe(t.prisma, intervention.clientId);
        await t.prisma.adresse.update({
            where: { id: autre.adresseId },
            data: { rue: 'Rue de la mauvaise adresse' },
        });
        const adresse = await t.prisma.adresse.findUniqueOrThrow({
            where: { id: intervention.adresseId },
        });

        const [i] = await liste(cookies, technicienId);

        expect(i.adresse).toMatchObject({
            rue: adresse.rue,
            codePostal: adresse.code_postal,
            ville: adresse.ville,
        });
    });

    it('CA08 — trie les interventions par heure de début [RG4]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();
        // Créées dans le désordre : 14h00, 8h00, 10h30
        const apresMidi = await interventionAvecBloc(technicienId, zoneId, {
            debut: 840,
        });
        const matin = await interventionAvecBloc(technicienId, zoneId, {
            debut: 480,
        });
        const milieu = await interventionAvecBloc(technicienId, zoneId, {
            debut: 630,
        });

        const interventions = await liste(cookies, technicienId);

        expect(interventions.map((i) => i.id)).toEqual([
            matin.id,
            milieu.id,
            apresMidi.id,
        ]);
        // Heure de début : le premier créneau réservé, après le déplacement
        // (bloc à 8h00 : déplacement 8h00, réservés 8h30–9h30)
        expect(interventions[0]).toMatchObject({ debut: 510, fin: 570 });
    });

    it('CA09 — n’affiche ni une intervention d’un autre technicien ni celle d’un autre jour [RG4]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();
        const duJour = await interventionAvecBloc(technicienId, zoneId);
        // Le lendemain, pour ce technicien
        await interventionAvecBloc(technicienId, zoneId, {
            jour: '2026-06-12',
        });
        // Le même jour, pour un autre technicien
        const autre = await creerUtilisateur(t.prisma, 'technicien');
        await interventionAvecBloc(autre.id, zoneId);

        const interventions = await liste(cookies, technicienId);

        expect(interventions.map((i) => i.id)).toEqual([duJour.id]);
    });

    it('CA10 — n’affiche pas une intervention sans créneau [RG4]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();
        const avecBloc = await interventionAvecBloc(technicienId, zoneId);
        // En conflit, ses créneaux supprimés : elle n'est portée par aucun
        // créneau, même si sa date prévue est ce jour-là
        const sansCreneau = await creerIntervention(t.prisma, {
            technicienId,
            statut: 'EnConflit',
        });
        await t.prisma.intervention.update({
            where: { id: sansCreneau.id },
            data: { date_prevue: new Date('2026-06-11T08:00:00.000Z') },
        });

        const interventions = await liste(cookies, technicienId);

        expect(interventions.map((i) => i.id)).toEqual([avecBloc.id]);
    });

    it('CA11 — affiche une intervention En conflit qui a gardé ses créneaux, avec son statut, à son heure de début [RG4]', async () => {
        const { cookies, technicienId, zoneId } = await preparer();
        const planifiee = await interventionAvecBloc(technicienId, zoneId, {
            debut: 480,
        });
        const enConflit = await interventionAvecBloc(technicienId, zoneId, {
            debut: 600,
            statut: 'EnConflit',
        });

        const interventions = await liste(cookies, technicienId);

        // À sa place dans l'ordre des heures, avec son statut : la page en
        // fait le repère « en conflit »
        expect(interventions.map((i) => [i.id, i.statut])).toEqual([
            [planifiee.id, 'Planifiee'],
            [enConflit.id, 'EnConflit'],
        ]);
        expect(interventions[1]).toMatchObject({ debut: 630 });
    });
});
