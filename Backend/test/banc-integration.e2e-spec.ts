import type { Server } from 'http';
import request from 'supertest';
import {
    creerApplicationDeTest,
    ApplicationDeTest,
} from './helpers/application';
import { viderLaBase } from './helpers/base';
import { creerUtilisateur } from './helpers/fabriques';
import { seConnecter } from './helpers/connexion';

// Test du banc lui-même : il prouve que la chaîne complète fonctionne
// (application réelle → guards → use case → repository → PostgreSQL de test).
// Ce n'est pas une user story : il ne porte pas de numéro CAnn.
describe("Banc de tests d'intégration", () => {
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

    it('répond sur une route publique, avec la base de test', async () => {
        await request(serveur).get('/api/referentiel/marques').expect(200, []);
    });

    it('refuse une route admin sans connexion (401)', async () => {
        await request(serveur).get('/api/admin/users').expect(401);
    });

    it('refuse une route admin à un client connecté (403)', async () => {
        const client = await creerUtilisateur(t.prisma, 'client');
        const cookies = await seConnecter(t.app, client);

        await request(serveur)
            .get('/api/admin/users')
            .set('Cookie', cookies)
            .expect(403);
    });

    it('autorise la route admin à un administrateur et lit la vraie base', async () => {
        const admin = await creerUtilisateur(t.prisma, 'admin');
        const cookies = await seConnecter(t.app, admin);

        const reponse = await request(serveur)
            .get('/api/admin/users')
            .set('Cookie', cookies)
            .expect(200);

        // L'admin créé juste avant est bien relu depuis PostgreSQL
        const body = reponse.body as { data: { email: string }[] };
        expect(body.data.map((u) => u.email)).toContain(admin.email);
    });
});
