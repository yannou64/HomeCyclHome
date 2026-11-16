// Charge Backend/.env dans process.env AVANT tout autre import : certains
// fichiers (jwt.config.ts…) lisent process.env dès leur import. Jusqu'à
// Prisma 6, le client Prisma le faisait implicitement ; Prisma 7 ne le fait
// plus. En Docker, il n'y a pas de .env : les variables viennent du compose
// et cette ligne ne fait rien.
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configurerApplication } from './configurer-application';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    // Préfixe, sécurité, cookies, CORS, validation : partagés avec les tests
    configurerApplication(app);

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
