import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

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

    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
