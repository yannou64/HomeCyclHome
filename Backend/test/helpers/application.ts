import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app/app.module';
import { configurerApplication } from '../../src/app/configurer-application';
import { EmailService } from '../../src/features/email/email.service';
import { PrismaService } from '../../src/shared/prisma/prisma.service';
import { StorageService } from '../../src/shared/storage/storage.service';

export type ApplicationDeTest = {
    app: INestApplication;
    prisma: PrismaService; // accès direct à la base, pour préparer et vérifier
    email: { [K in keyof EmailService]: jest.Mock };
    stockage: { [K in keyof StorageService]: jest.Mock };
};

/**
 * Démarre la vraie application (AppModule + configuration de main.ts), sans
 * ouvrir de port : Supertest lui envoie les requêtes directement.
 *
 * Seuls les services externes sont remplacés par des faux : un test n'envoie
 * jamais d'email et n'écrit jamais sur S3. Les faux enregistrent leurs appels,
 * ce qui permet de vérifier qu'un email serait parti.
 */
export async function creerApplicationDeTest(): Promise<ApplicationDeTest> {
    const email = {
        sendConfirmationEmail: jest.fn().mockResolvedValue(undefined),
        sendInterventionConfirmationEmail: jest
            .fn()
            .mockResolvedValue(undefined),
    };
    const stockage = {
        uploadFile: jest.fn().mockResolvedValue('photos/fausse-cle.jpg'),
    };

    const moduleDeTest = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider(EmailService)
        .useValue(email)
        .overrideProvider(StorageService)
        .useValue(stockage)
        .compile();

    const app = moduleDeTest.createNestApplication();
    configurerApplication(app);
    await app.init();

    return { app, prisma: app.get(PrismaService), email, stockage };
}
