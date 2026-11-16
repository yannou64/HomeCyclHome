import { PrismaService } from '../src/shared/prisma/prisma.service';
import { ajouterAuCommentaire } from '../src/shared/database/commentaire-partage';
import { viderLaBase } from './helpers/base';
import { creerIntervention } from './helpers/fabriques';

// Brique du socle : l'ajout au commentaire partagé, prouvé sur PostgreSQL.
// Ce n'est pas une user story : pas de numéro CAnn.

const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('Commentaire partagé sur PostgreSQL', () => {
    const prisma = new PrismaService();
    let interventionId: string;

    beforeAll(async () => {
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await viderLaBase(prisma);
        interventionId = (await creerIntervention(prisma)).id;
    });

    const lire = async () =>
        await prisma.intervention.findUniqueOrThrow({
            where: { id: interventionId },
            select: { commentaire_technicien: true, date_maj: true },
        });

    it('ajoute la première entrée dans un commentaire vide', async () => {
        await ajouterAuCommentaire(prisma, interventionId, 'entrée 1');
        expect((await lire()).commentaire_technicien).toBe('entrée 1');
    });

    it('place la nouvelle entrée en tête et laisse l’ancien texte intact', async () => {
        await ajouterAuCommentaire(prisma, interventionId, 'entrée 1');
        await ajouterAuCommentaire(prisma, interventionId, 'entrée 2');
        expect((await lire()).commentaire_technicien).toBe(
            'entrée 2\nentrée 1',
        );
    });

    it('conserve les deux entrées de deux ajouts simultanés', async () => {
        await ajouterAuCommentaire(prisma, interventionId, 'entrée 0');
        // Deux transactions écrivent en même temps ; la première garde le verrou
        await Promise.all([
            prisma.$transaction(async (tx) => {
                await ajouterAuCommentaire(tx, interventionId, 'entrée A');
                await attendre(200);
            }),
            (async () => {
                await attendre(50);
                await ajouterAuCommentaire(prisma, interventionId, 'entrée B');
            })(),
        ]);
        expect((await lire()).commentaire_technicien).toBe(
            'entrée B\nentrée A\nentrée 0',
        );
    });

    it('met à jour date_maj en UTC, comme Prisma', async () => {
        const avant = Date.now();
        await ajouterAuCommentaire(prisma, interventionId, 'entrée 1');
        const dateMaj = (await lire()).date_maj.getTime();
        // À quelques secondes près : un décalage d'une heure trahirait un fuseau
        expect(Math.abs(dateMaj - avant)).toBeLessThan(5000);
    });

    it('renvoie 0 pour une intervention inexistante', async () => {
        await expect(
            ajouterAuCommentaire(
                prisma,
                '00000000-0000-0000-0000-000000000000',
                'x',
            ),
        ).resolves.toBe(0);
    });
});
