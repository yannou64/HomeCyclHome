import { execSync } from 'child_process';
import { chargerEnvTest } from './charger-env-test';

/**
 * Exécuté UNE fois, avant toute la série de tests d'intégration.
 *
 * Applique à la base de test les migrations qui lui manquent
 * (`migrate deploy`), sans rien effacer. Les données, elles, sont vidées
 * avant chaque test par viderLaBase().
 *
 * Pourquoi pas `migrate reset` : il détruit la base à chaque lancement, et
 * Prisma le bloque quand il est lancé par un agent IA. Une remise à zéro
 * complète (migrations réécrites au socle V2, par exemple) se fait à la main,
 * une fois : voir Backend/CLAUDE.md, section Tests.
 */
export default function globalSetup(): void {
    chargerEnvTest();
    // Le processus enfant hérite de process.env : prisma.config.ts lit donc
    // le DATABASE_URL de test (dotenv n'écrase pas une variable déjà définie).
    execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: process.env,
    });
}
