import { config } from 'dotenv';
import { resolve } from 'path';

/**
 * Charge Backend/.env.test dans process.env, en écrasant toute valeur déjà
 * présente (notamment celles de .env), puis applique le garde-fou.
 *
 * Appelé deux fois : par global-setup.ts (avant la remise à zéro de la base)
 * et par setup-fichier.ts (avant chaque fichier de test, car Jest exécute les
 * tests dans des processus séparés qui n'héritent pas de ce chargement).
 */
export function chargerEnvTest(): void {
    config({
        path: resolve(__dirname, '../../.env.test'),
        override: true,
        quiet: true,
    });
    verifierBaseDeTest(process.env.DATABASE_URL);
}

/**
 * Garde-fou : les tests vident la base à chaque test. Ils refusent donc de
 * tourner si DATABASE_URL ne désigne pas une base dont le nom finit par
 * « _test ». Une erreur de configuration ne peut pas effacer la base de
 * développement.
 */
export function verifierBaseDeTest(databaseUrl: string | undefined): void {
    if (!databaseUrl) {
        throw new Error(
            'DATABASE_URL absente : créer Backend/.env.test (modèle : .env.test.example).',
        );
    }
    const nomBase = new URL(databaseUrl).pathname.slice(1);
    if (!nomBase.endsWith('_test')) {
        throw new Error(
            `Garde-fou : la base « ${nomBase} » n'est pas une base de test (nom attendu en « _test »). Tests arrêtés.`,
        );
    }
}
