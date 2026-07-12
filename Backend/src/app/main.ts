import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { helmetConfig } from '../config/helmet.config';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

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

    // ─── Swagger (désactivé en production) ────────────────────────────────
    if (process.env.NODE_ENV !== 'production') {
        const config = new DocumentBuilder()
            .setTitle("HomeCycl'Home API")
            .setDescription(
                "API REST de réservation d'interventions vélo à domicile. " +
                    'Authentification par cookie HttpOnly (JWT). ' +
                    "Effectuez d'abord POST /api/auth/login pour obtenir le cookie de session.",
            )
            .setVersion('1.0')
            .addCookieAuth('access_token', {
                type: 'apiKey',
                in: 'cookie',
                name: 'access_token',
                description:
                    'Cookie HttpOnly posé automatiquement par POST /api/auth/login',
            })
            .addTag(
                'Authentification',
                'Inscription, connexion, déconnexion, renouvellement de token',
            )
            .addTag('Profil', 'Gestion du profil utilisateur connecté')
            .addTag('Cycles', 'Gestion des vélos du client')
            .addTag('Adresses', "Carnet d'adresses du client")
            .addTag('Forfaits', 'Catalogue des prestations disponibles')
            .addTag('Créneaux', 'Disponibilités pour la réservation')
            .addTag('Interventions', 'Réservation et suivi des interventions')
            .addTag('Zones', 'Vérification et gestion des zones géographiques')
            .addTag(
                'Administration — Utilisateurs',
                'CRUD utilisateurs (admin)',
            )
            .addTag(
                'Administration — Forfaits',
                'Gestion du catalogue forfaits (admin)',
            )
            .addTag(
                'Administration — Zones',
                'Gestion des zones géographiques (admin)',
            )
            .addTag(
                'Administration — Affectations',
                'Affectation techniciens / zones (admin)',
            )
            .addTag(
                'Administration — Planning',
                'Modèles, pauses, indisponibilités, créneaux (admin)',
            )
            .addTag(
                'Administration — Interventions',
                'Supervision des interventions (admin)',
            )
            .addTag('Référentiel — Marques', 'Référentiel des marques de vélos')
            .addTag('Référentiel — Types', 'Référentiel des types de cycles')
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api-docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                docExpansion: 'list',
                filter: true,
                showRequestDuration: true,
            },
            customSiteTitle: "HomeCycl'Home — Documentation API",
        });
    }
    // ─────────────────────────────────────────────────────────────────────

    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
