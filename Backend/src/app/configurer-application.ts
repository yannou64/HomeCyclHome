import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import type { Express } from 'express';
import { helmetConfig } from '../config/helmet.config';

/**
 * Configuration HTTP de l'application, partagée par main.ts et les tests
 * d'intégration. Un test qui démarrerait AppModule sans elle testerait une
 * autre application : pas de préfixe /api, pas de validation des DTO, pas de
 * lecture des cookies.
 */
export function configurerApplication(app: INestApplication): void {
    // Fait confiance aux 2 reverse proxies en prod (Nginx hôte + Nginx interne
    // Docker) pour lire la vraie IP client via X-Forwarded-For — indispensable
    // pour que le rate limiting (@nestjs/throttler) compte par visiteur réel.
    // `set()` est une méthode Express, non exposée par le type INestApplication.
    // `getInstance()` retourne `any` dans les types NestJS : on caste
    // explicitement en `Express` (règle @typescript-eslint/no-unsafe-*).
    const expressInstance = app.getHttpAdapter().getInstance() as Express;
    expressInstance.set('trust proxy', 2);

    app.setGlobalPrefix('api');

    // Headers de sécurité HTTP (X-Frame-Options, HSTS, CSP...)
    app.use(helmet(helmetConfig));

    // Lecture des cookies entrants (nécessaire pour la JWT strategy)
    app.use(cookieParser());

    // Autorise les requêtes depuis le frontend avec les cookies
    app.enableCors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    });

    // Validation automatique des DTOs + rejet des champs inconnus
    app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, transform: true }),
    );
}
