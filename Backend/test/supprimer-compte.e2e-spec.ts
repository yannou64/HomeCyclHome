import type { Server } from 'http';
import request from 'supertest';
import {
    creerApplicationDeTest,
    ApplicationDeTest,
} from './helpers/application';
import { viderLaBase } from './helpers/base';
import {
    creerAdresseDe,
    creerCycle,
    creerIntervention,
    creerUtilisateur,
} from './helpers/fabriques';
import { seConnecter } from './helpers/connexion';
import {
    USERS_REPO,
    type IUsersRepository,
} from '../src/features/users/repositories/users.repository.interface';
import type { StatutIntervention } from '../src/generated/prisma/enums';

// Messages imposés par la RG3 du cas d'utilisation « (Tous) Supprimer un compte 2.0 ».
// Recopiés ici volontairement : le test vérifie le texte exact attendu par la spec.
const MESSAGE_CLIENT =
    'Votre compte est lié à des interventions et ne peut pas être supprimé pour le moment. Contactez-nous pour toute demande sur vos données.';
const MESSAGE_ADMIN =
    'Ce compte est lié à des interventions : il ne peut pas être supprimé.';

// Les quatre statuts d'une intervention : la RG1 s'applique à tous, Annulée comprise.
const TOUS_LES_STATUTS: StatutIntervention[] = [
    'Planifiee',
    'Realisee',
    'Annulee',
    'EnConflit',
];

// Tous les critères de cette US se testent sur PostgreSQL réel (et non sur un
// stockage simulé) : c'est la clé étrangère de la base qui avait révélé le défaut
// de la V1, et un simulacre ne l'applique pas.
describe("US-01 Refuser la suppression d'un compte lié à des interventions 2.0", () => {
    let t: ApplicationDeTest;
    let serveur: Server;

    beforeAll(async () => {
        t = await creerApplicationDeTest();
        serveur = t.app.getHttpServer() as Server;
    });

    beforeEach(async () => {
        await viderLaBase(t.prisma);
    });

    afterEach(() => {
        // Annule les espions posés par un test (CA06) : les autres tests
        // retrouvent le vrai repository.
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await t.app.close();
    });

    /**
     * Vérifie que le compte et tout ce qui lui est rattaché sont toujours en base.
     * Sert aux critères de refus : « le compte reste intact ».
     */
    async function attendreCompteIntact(intervention: {
        id: string;
        clientId: string;
        cycleId: string;
        adresseId: string;
    }): Promise<void> {
        const p = t.prisma;
        expect(
            await p.utilisateur.findUnique({
                where: { id: intervention.clientId },
            }),
        ).not.toBeNull();
        expect(
            await p.cycle.findUnique({ where: { id: intervention.cycleId } }),
        ).not.toBeNull();
        expect(
            await p.peutSeSituer.count({
                where: { utilisateur_id: intervention.clientId },
            }),
        ).toBe(1);
        expect(
            await p.adresse.findUnique({
                where: { id: intervention.adresseId },
            }),
        ).not.toBeNull();
        expect(
            await p.intervention.findUnique({
                where: { id: intervention.id },
            }),
        ).not.toBeNull();
    }

    it('CA01 — refuse en 409 la suppression par le client lié à une intervention, quel que soit son statut, et laisse tout intact [RG1, RG2]', async () => {
        // Un client par statut : chacun n'a qu'une intervention, de ce statut-là
        for (const statut of TOUS_LES_STATUTS) {
            const client = await creerUtilisateur(t.prisma, 'client');
            const intervention = await creerIntervention(t.prisma, {
                statut,
                clientId: client.id,
            });
            const cookies = await seConnecter(t.app, client);

            await request(serveur)
                .delete('/api/users/me')
                .set('Cookie', cookies)
                .expect(409);

            await attendreCompteIntact(intervention);
        }
    });

    it("CA02 — renvoie au client le message qui l'invite à nous contacter et laisse sa session ouverte [RG3]", async () => {
        const client = await creerUtilisateur(t.prisma, 'client');
        await creerIntervention(t.prisma, { clientId: client.id });
        const cookies = await seConnecter(t.app, client);

        const reponse = await request(serveur)
            .delete('/api/users/me')
            .set('Cookie', cookies)
            .expect(409);

        expect((reponse.body as { message: string }).message).toBe(
            MESSAGE_CLIENT,
        );
        // Session ouverte : les mêmes cookies donnent toujours accès au profil
        await request(serveur)
            .get('/api/users/me')
            .set('Cookie', cookies)
            .expect(200);
    });

    it("CA03 — refuse en 409 la suppression par l'admin d'un client lié à une intervention [RG1, RG2]", async () => {
        const admin = await creerUtilisateur(t.prisma, 'admin');
        const intervention = await creerIntervention(t.prisma);
        const cookies = await seConnecter(t.app, admin);

        await request(serveur)
            .delete(`/api/admin/users/${intervention.clientId}`)
            .set('Cookie', cookies)
            .expect(409);

        await attendreCompteIntact(intervention);
    });

    it("CA04 — refuse en 409 la suppression par l'admin d'un technicien lié à une intervention [RG1, RG2]", async () => {
        const admin = await creerUtilisateur(t.prisma, 'admin');
        const intervention = await creerIntervention(t.prisma);
        const cookies = await seConnecter(t.app, admin);

        await request(serveur)
            .delete(`/api/admin/users/${intervention.technicienId}`)
            .set('Cookie', cookies)
            .expect(409);

        expect(
            await t.prisma.utilisateur.findUnique({
                where: { id: intervention.technicienId },
            }),
        ).not.toBeNull();
        expect(
            await t.prisma.intervention.findUnique({
                where: { id: intervention.id },
            }),
        ).not.toBeNull();
    });

    it("CA05 — renvoie à l'admin le message qui explique que le compte est lié à des interventions [RG3]", async () => {
        const admin = await creerUtilisateur(t.prisma, 'admin');
        const intervention = await creerIntervention(t.prisma);
        const cookies = await seConnecter(t.app, admin);

        const reponse = await request(serveur)
            .delete(`/api/admin/users/${intervention.clientId}`)
            .set('Cookie', cookies)
            .expect(409);

        expect((reponse.body as { message: string }).message).toBe(
            MESSAGE_ADMIN,
        );
    });

    it('CA06 — traduit en ce même 409 la violation de clé étrangère due à une intervention créée entre le contrôle et la suppression [RG2]', async () => {
        const client = await creerUtilisateur(t.prisma, 'client');
        await creerIntervention(t.prisma, { clientId: client.id });
        const cookies = await seConnecter(t.app, client);

        // On simule la course : le contrôle « ne voit » aucune intervention
        // (comme si elle avait été créée juste après), alors qu'elle existe en
        // base. Le DELETE part donc, et c'est PostgreSQL qui le refuse.
        const repo = t.app.get<IUsersRepository>(USERS_REPO);
        jest.spyOn(repo, 'compterInterventions').mockResolvedValue(0);

        const reponse = await request(serveur)
            .delete('/api/users/me')
            .set('Cookie', cookies)
            .expect(409);

        expect((reponse.body as { message: string }).message).toBe(
            MESSAGE_CLIENT,
        );
        expect(
            await t.prisma.utilisateur.findUnique({ where: { id: client.id } }),
        ).not.toBeNull();
    });

    it('CA07 — supprime réellement le compte, les cycles et les liens aux adresses du client sans intervention [RG4]', async () => {
        const client = await creerUtilisateur(t.prisma, 'client');
        const cycle = await creerCycle(t.prisma, client.id);
        const { adresseId, lienId } = await creerAdresseDe(t.prisma, client.id);
        const cookies = await seConnecter(t.app, client);

        await request(serveur)
            .delete('/api/users/me')
            .set('Cookie', cookies)
            .expect(204);

        expect(
            await t.prisma.utilisateur.findUnique({ where: { id: client.id } }),
        ).toBeNull();
        expect(
            await t.prisma.cycle.findUnique({ where: { id: cycle.id } }),
        ).toBeNull();
        expect(
            await t.prisma.peutSeSituer.findUnique({ where: { id: lienId } }),
        ).toBeNull();
        // Décision du 16/11/2026 (Écarts) : l'adresse est partagée, seule sa
        // liaison au client disparaît ; la ligne Adresse est conservée.
        expect(
            await t.prisma.adresse.findUnique({ where: { id: adresseId } }),
        ).not.toBeNull();
    });

    it('CA08 — la clé étrangère refuse la suppression directe en base d’un client ou d’un technicien référencé [RG5]', async () => {
        const intervention = await creerIntervention(t.prisma);

        // P2003 : code Prisma d'une contrainte de clé étrangère violée
        await expect(
            t.prisma.utilisateur.delete({
                where: { id: intervention.clientId },
            }),
        ).rejects.toMatchObject({ code: 'P2003' });
        await expect(
            t.prisma.utilisateur.delete({
                where: { id: intervention.technicienId },
            }),
        ).rejects.toMatchObject({ code: 'P2003' });
    });
});
