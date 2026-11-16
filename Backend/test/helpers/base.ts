import { PrismaService } from '../../src/shared/prisma/prisma.service';

/**
 * Vide toutes les tables de la base de test, sauf l'historique des migrations.
 * À appeler avant chaque test : chacun part d'une base vide et crée seulement
 * les données dont il a besoin.
 *
 * La liste des tables est lue dans PostgreSQL : une table ajoutée par une
 * migration est vidée sans avoir à modifier ce fichier.
 */
export async function viderLaBase(prisma: PrismaService): Promise<void> {
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
    `;
    if (tables.length === 0) return;
    const liste = tables.map((t) => `"public"."${t.tablename}"`).join(', ');
    // CASCADE : vide aussi les tables liées par clé étrangère, dans le bon ordre
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${liste} CASCADE`);
}
