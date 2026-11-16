import { PrismaService } from '../src/shared/prisma/prisma.service';
import {
    EtatModifieEntreTempsError,
    exigerLignesModifiees,
} from '../src/shared/database/ecriture-conditionnelle';
import { viderLaBase } from './helpers/base';
import { creerUtilisateur } from './helpers/fabriques';

// Brique du socle : l'écriture conditionnelle prouvée sur un vrai PostgreSQL.
// Deux réservations simultanées se disputent un créneau : une seule réussit,
// l'autre est annulée en entier (glossaire « Écritures », RG23 de Réserver).
// Ce n'est pas une user story : pas de numéro CAnn.

const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('Écriture conditionnelle sur PostgreSQL', () => {
    const prisma = new PrismaService();
    let ids: { c1: string; c2: string; c3: string };

    beforeAll(async () => {
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await viderLaBase(prisma);
        const technicien = await creerUtilisateur(prisma, 'technicien');
        const zone = await prisma.zone.create({
            data: { nom_zone: 'Zone test' },
        });
        // Trois créneaux Libres consécutifs : 9h00, 9h30, 10h00 (UTC, peu importe ici)
        const creer = (iso: string) =>
            prisma.creneau.create({
                data: {
                    date_debut: new Date(iso),
                    technicien_id: technicien.id,
                    zone_id: zone.id,
                },
            });
        const [c1, c2, c3] = await Promise.all([
            creer('2026-06-01T09:00:00.000Z'),
            creer('2026-06-01T09:30:00.000Z'),
            creer('2026-06-01T10:00:00.000Z'),
        ]);
        ids = { c1: c1.id, c2: c2.id, c3: c3.id };
    });

    // Réserve des créneaux seulement s'ils sont TOUS encore Libres
    const reserver = (creneauIds: string[], pauseAvantValidation = 0) =>
        prisma.$transaction(async (tx) => {
            const resultat = await tx.creneau.updateMany({
                where: { id: { in: creneauIds }, statut: 'Libre' },
                data: { statut: 'InterventionReservee' },
            });
            exigerLignesModifiees(resultat, creneauIds.length);
            // Garde les verrous un instant : l'autre transaction doit attendre
            await attendre(pauseAvantValidation);
        });

    it('deux réservations simultanées du même bloc : une seule réussit', async () => {
        const resultats = await Promise.allSettled([
            reserver([ids.c1, ids.c2], 200),
            reserver([ids.c1, ids.c2], 200),
        ]);

        const reussies = resultats.filter((r) => r.status === 'fulfilled');
        const refusees = resultats.filter(
            (r): r is PromiseRejectedResult => r.status === 'rejected',
        );
        expect(reussies).toHaveLength(1);
        expect(refusees).toHaveLength(1);
        expect(refusees[0].reason).toBeInstanceOf(EtatModifieEntreTempsError);
    });

    it('deux blocs qui se chevauchent : le perdant est annulé en entier, tout ou rien', async () => {
        // A réserve 9h00 + 9h30 ; B, lancé juste après, veut 9h30 + 10h00
        const a = reserver([ids.c1, ids.c2], 200);
        await attendre(50);
        const b = reserver([ids.c2, ids.c3]);

        await expect(a).resolves.toBeUndefined();
        await expect(b).rejects.toBeInstanceOf(EtatModifieEntreTempsError);

        const statuts = await prisma.creneau.findMany({
            where: { id: { in: [ids.c1, ids.c2, ids.c3] } },
            orderBy: { date_debut: 'asc' },
            select: { statut: true },
        });
        // 10h00 reste Libre : la modification partielle de B a été annulée
        expect(statuts.map((s) => s.statut)).toEqual([
            'InterventionReservee',
            'InterventionReservee',
            'Libre',
        ]);
    });
});
