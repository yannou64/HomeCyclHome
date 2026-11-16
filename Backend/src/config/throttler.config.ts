import { ThrottlerModuleOptions } from '@nestjs/throttler';

// Limite générale appliquée à toute l'API (100 req/min/IP).
// Les routes auth sensibles (login, register...) resserrent cette limite
// via le décorateur @Throttle() sur le contrôleur.
// Désactivée pendant les tests d'intégration (NODE_ENV=test) : une série de
// connexions finirait sinon en 429, sans rapport avec ce que le test vérifie.
export const throttlerConfig: ThrottlerModuleOptions = {
    throttlers: [{ name: 'default', ttl: 60_000, limit: 100 }],
    skipIf: () => process.env.NODE_ENV === 'test',
};
