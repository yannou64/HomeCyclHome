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

// Liste des modèles d'un technicien (page Planification, séquence étapes 2 à 8).
// Développée en avance (S2) avec « Créer un modèle de planification 2.0 »,
// dont elle permet le retour à la liste (écart du 18/11/2026, option c).
// CA05 à CA09 portent sur l'affichage : ils restent pour S3.
type ModeleListe = {
    id: string;
    intitule: string;
    zone: { id: string; nomZone: string; couleur: string };
    valide: boolean;
};

describe('US-01 Choisir le mode de planification 2.0', () => {
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

    async function cookiesAdmin(): Promise<string[]> {
        return seConnecter(t.app, await creerUtilisateur(t.prisma, 'admin'));
    }

    const route = (technicienId: string) =>
        `/api/admin/planning/techniciens/${technicienId}/modeles`;

    it('CA01 — refuse l’accès à un utilisateur sans le rôle admin [RG1]', async () => {
        const technicien = await creerUtilisateur(t.prisma, 'technicien');

        for (const role of ['client', 'technicien'] as const) {
            const cookies = await seConnecter(
                t.app,
                await creerUtilisateur(t.prisma, role),
            );
            await request(serveur)
                .get(route(technicien.id))
                .set('Cookie', cookies)
                .expect(403);
        }
    });

    it('CA02 — répond « introuvable » quand le technicien n’existe pas [—]', async () => {
        const cookies = await cookiesAdmin();
        const client = await creerUtilisateur(t.prisma, 'client');

        for (const id of ['00000000-0000-4000-8000-000000000000', client.id]) {
            await request(serveur)
                .get(route(id))
                .set('Cookie', cookies)
                .expect(404);
        }
    });

    it('CA03 — liste les modèles du technicien, chacun avec son intitulé et sa zone [—]', async () => {
        const technicien = await creerUtilisateur(t.prisma, 'technicien');
        const zone = await creerZone(t.prisma, { couleur: 'Bleu' });
        await creerAffectation(t.prisma, technicien.id, zone.id);
        for (const intitule of ['Semaine matin', 'Après-midi']) {
            await creerModele(t.prisma, {
                technicienId: technicien.id,
                zoneId: zone.id,
                intitule,
            });
        }

        const reponse = await request(serveur)
            .get(route(technicien.id))
            .set('Cookie', await cookiesAdmin())
            .expect(200);

        const modeles = reponse.body as ModeleListe[];
        // Triés par intitulé
        expect(modeles.map((m) => m.intitule)).toEqual([
            'Après-midi',
            'Semaine matin',
        ]);
        for (const m of modeles) {
            expect(m.zone).toMatchObject({ id: zone.id, couleur: 'Bleu' });
        }
    });

    it('CA04 — n’affiche pas les modèles des autres techniciens [—]', async () => {
        const technicien = await creerUtilisateur(t.prisma, 'technicien');
        const autre = await creerUtilisateur(t.prisma, 'technicien');
        const zone = await creerZone(t.prisma);
        await creerAffectation(t.prisma, autre.id, zone.id);
        await creerModele(t.prisma, {
            technicienId: autre.id,
            zoneId: zone.id,
            intitule: 'Modèle de l’autre',
        });

        const reponse = await request(serveur)
            .get(route(technicien.id))
            .set('Cookie', await cookiesAdmin())
            .expect(200);

        expect(reponse.body).toEqual([]);
    });
});

// RG15 de « Planifier un technicien 2.0 » : moitié backend seulement. Le rouge,
// le libellé et le lien inactif (CA06) seront faits et vérifiés en S3.
describe('Liste des modèles — repère de modèle invalide', () => {
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

    it('marque invalide un modèle dont la zone n’est plus affectée ou est inactive', async () => {
        const technicien = await creerUtilisateur(t.prisma, 'technicien');
        const zoneValide = await creerZone(t.prisma);
        const zoneDesaffectee = await creerZone(t.prisma);
        const zoneInactive = await creerZone(t.prisma, { isActive: false });
        await creerAffectation(t.prisma, technicien.id, zoneValide.id);
        await creerAffectation(t.prisma, technicien.id, zoneInactive.id);
        // zoneDesaffectee : jamais affectée (équivaut à une affectation retirée)
        for (const [intitule, zone] of [
            ['A valide', zoneValide],
            ['B désaffectée', zoneDesaffectee],
            ['C inactive', zoneInactive],
        ] as const) {
            await creerModele(t.prisma, {
                technicienId: technicien.id,
                zoneId: zone.id,
                intitule,
            });
        }

        const reponse = await request(t.app.getHttpServer() as Server)
            .get(`/api/admin/planning/techniciens/${technicien.id}/modeles`)
            .set(
                'Cookie',
                await seConnecter(
                    t.app,
                    await creerUtilisateur(t.prisma, 'admin'),
                ),
            )
            .expect(200);

        expect(
            (reponse.body as ModeleListe[]).map((m) => [m.intitule, m.valide]),
        ).toEqual([
            ['A valide', true],
            ['B désaffectée', false],
            ['C inactive', false],
        ]);
    });
});
