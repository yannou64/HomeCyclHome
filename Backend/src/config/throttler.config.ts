import { ThrottlerModuleOptions } from '@nestjs/throttler';

// Limite générale appliquée à toute l'API (100 req/min/IP).
// Les routes auth sensibles (login, register...) resserrent cette limite
// via le décorateur @Throttle() sur le contrôleur.
export const throttlerConfig: ThrottlerModuleOptions = [
    { name: 'default', ttl: 60_000, limit: 100 },
];
