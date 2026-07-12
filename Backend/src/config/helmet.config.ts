import { HelmetOptions } from 'helmet';

// CSP désactivée hors production pour ne pas bloquer les scripts/styles
// inline de Swagger UI (/api-docs), lui-même désactivé en production.
export const helmetConfig: HelmetOptions = {
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
};
