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

describe('US-03 Supprimer un modèle de planification 2.0', () => {
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
     * active, et un modèle à deux blocs dans cette zone. `route` est
     * l'adresse du modèle.
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
            blocs: [
                { debut: 480, fin: 720 },
                { debut: 840, fin: 960 },
            ],
        });
        return {
            cookies: await seConnecter(t.app, admin),
            technicienId: technicien.id,
            zoneId: zone.id,
            modeleId: modele.id,
            route: `/api/admin/planning/techniciens/${technicien.id}/modeles/${modele.id}`,
        };
    }

    /** Le modèle existe-t-il encore, et combien de blocs reste-t-il ? */
    async function etat(modeleId: string) {
        return {
            modele: await t.prisma.modelePlanification.count({
                where: { id: modeleId },
            }),
            blocs: await t.prisma.blocHoraire.count({
                where: { modele_planification_id: modeleId },
            }),
        };
    }

    it('CA01 — refuse l’accès à un utilisateur sans le rôle admin [RG1]', async () => {
        const { route, modeleId } = await preparer();

        for (const role of ['client', 'technicien'] as const) {
            const cookies = await seConnecter(
                t.app,
                await creerUtilisateur(t.prisma, role),
            );
            await request(serveur)
                .delete(route)
                .set('Cookie', cookies)
                .expect(403);
        }

        expect(await etat(modeleId)).toEqual({ modele: 1, blocs: 2 });
    });

    it('CA02 — répond « introuvable » pour un modèle inexistant ou d’un autre technicien [RG2, RG10]', async () => {
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
            await request(serveur)
                .delete(
                    `/api/admin/planning/techniciens/${technicienId}/modeles/${modeleId}`,
                )
                .set('Cookie', cookies)
                .expect(404);
        }

        // Le modèle de l'autre technicien n'a pas été touché
        expect(await etat(modeleAutre.id)).toEqual({ modele: 1, blocs: 1 });
    });

    it('CA05 — supprime le modèle et ses blocs [RG9]', async () => {
        const { cookies, modeleId, route } = await preparer();

        // Côté serveur, la demande arrive après « Continuer » : elle supprime
        await request(serveur).delete(route).set('Cookie', cookies).expect(204);

        expect(await etat(modeleId)).toEqual({ modele: 0, blocs: 0 });
    });

    it('CA06 — supprime aussi un modèle invalide, avec les mêmes effets [RG9, RG11]', async () => {
        const { cookies, technicienId, zoneId, modeleId, route } =
            await preparer();
        // Invalide : sa zone n'est plus affectée au technicien
        await t.prisma.technicienZone.deleteMany({
            where: { technicien_id: technicienId, zone_id: zoneId },
        });

        await request(serveur).delete(route).set('Cookie', cookies).expect(204);

        expect(await etat(modeleId)).toEqual({ modele: 0, blocs: 0 });
    });

    it('CA09 — laisse les créneaux existants inchangés [RG7]', async () => {
        const { cookies, technicienId, zoneId, route } = await preparer();
        await creerCreneau(t.prisma, { technicienId, zoneId });
        const avant = await t.prisma.creneau.findMany({
            orderBy: { id: 'asc' },
        });

        await request(serveur).delete(route).set('Cookie', cookies).expect(204);

        const apres = await t.prisma.creneau.findMany({
            orderBy: { id: 'asc' },
        });
        expect(apres).toEqual(avant);
        expect(apres).toHaveLength(1);
    });

    it('CA10 — répond « introuvable » pour un modèle déjà supprimé [RG10]', async () => {
        const { cookies, route } = await preparer();

        // Premier onglet : supprimé ; second onglet, même demande : introuvable
        await request(serveur).delete(route).set('Cookie', cookies).expect(204);
        await request(serveur).delete(route).set('Cookie', cookies).expect(404);
    });

    it('CA11 — ne supprime rien quand une écriture échoue : tout ou rien [—]', async () => {
        const { technicienId, modeleId } = await preparer();
        const autre = await creerUtilisateur(t.prisma, 'technicien');
        const repo = t.app.get<IPlanningRepository>(PLANNING_REPO);

        // Appel direct du repository au nom d'un autre technicien : les blocs
        // sont supprimés en premier (filtre sur le modèle seul), puis la
        // suppression conditionnelle du modèle ne trouve aucune ligne et
        // annule la transaction. Les blocs doivent donc être revenus.
        expect(await repo.supprimerModele(autre.id, modeleId)).toBe(false);
        expect(await etat(modeleId)).toEqual({ modele: 1, blocs: 2 });

        // Contrôle : au nom du bon technicien, tout part
        expect(await repo.supprimerModele(technicienId, modeleId)).toBe(true);
        expect(await etat(modeleId)).toEqual({ modele: 0, blocs: 0 });
    });
});
