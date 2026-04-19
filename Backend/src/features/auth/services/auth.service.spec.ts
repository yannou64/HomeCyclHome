import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../email/email.service';
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';

function mockRes(): Response {
    return {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
    } as unknown as Response;
}

describe('AuthService', () => {
    let service: AuthService;
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: PrismaService,
                    useValue: {
                        utilisateur: {
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
                {
                    provide: JwtService,
                    useValue: { sign: jest.fn() },
                },
                {
                    provide: EmailService,
                    useValue: { sendConfirmationEmail: jest.fn() },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        it('devrait lever ConflictException si email déjà utilisé', async () => {
            // ARRANGE — on simule que Prisma trouve un utilisateur existant
            const prismaMock = module.get<PrismaService>(PrismaService);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            jest.spyOn(prismaMock.utilisateur, 'findUnique').mockResolvedValue({
                id: 'uuid-existant',
                email: 'test@gmail.com',
            } as any);

            // ACT + ASSERT — on vérifie que l'exception est bien levée
            await expect(
                service.register({
                    prenom: 'Yannick',
                    nom: 'Biot',
                    email: 'test@gmail.com',
                    telephone: '0612345678',
                    password: 'motdepasse123',
                }),
            ).rejects.toThrow(ConflictException);
        });
        it('devrait créer un utilisateur et envoyer un email de confirmation', async () => {
            // ARRANGE
            const prismaMock = module.get<PrismaService>(PrismaService);
            const emailMock = module.get<EmailService>(EmailService);

            // findUnique retourne null → email disponible
            jest.spyOn(prismaMock.utilisateur, 'findUnique').mockResolvedValue(
                null,
            );

            // create retourne l'utilisateur créé
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            jest.spyOn(prismaMock.utilisateur, 'create').mockResolvedValue({
                id: 'nouvel-uuid',
                email: 'nouveau@gmail.com',
                prenom: 'Yannick',
            } as any);

            // sendConfirmationEmail — on surveille qu'il est bien appelé
            const sendEmailSpy = jest
                .spyOn(emailMock, 'sendConfirmationEmail')
                .mockResolvedValue(undefined);

            // ACT
            const result = await service.register({
                prenom: 'Yannick',
                nom: 'Biot',
                email: 'nouveau@gmail.com',
                telephone: '0612345678',
                password: 'motdepasse123',
            });

            // ASSERT
            expect(result.message).toContain('Inscription réussie');
            expect(sendEmailSpy).toHaveBeenCalledTimes(1);
            expect(sendEmailSpy).toHaveBeenCalledWith(
                'nouveau@gmail.com',
                'Yannick',
                expect.any(String), // le token généré aléatoirement
            );
        });
    });

    describe('confirmEmail', () => {
        it('devrait lever NotFoundException si token inconnu', async () => {
            const prismaMock = module.get<PrismaService>(PrismaService);
            jest.spyOn(prismaMock.utilisateur, 'findUnique').mockResolvedValue(
                null,
            );

            await expect(service.confirmEmail('token-inconnu')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('devrait lever BadRequestException si token expiré', async () => {
            const prismaMock = module.get<PrismaService>(PrismaService);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            jest.spyOn(prismaMock.utilisateur, 'findUnique').mockResolvedValue({
                id: 'uuid',
                email: 'test@gmail.com',
                token_expires_at: new Date('2000-01-01'), // date dans le passé → expiré
            } as any);

            await expect(service.confirmEmail('token-expiré')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('devrait activer le compte si token valide', async () => {
            const prismaMock = module.get<PrismaService>(PrismaService);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            jest.spyOn(prismaMock.utilisateur, 'findUnique').mockResolvedValue({
                id: 'uuid',
                email: 'test@gmail.com',
                token_expires_at: new Date('2099-01-01'), // date dans le futur → valide
            } as any);

            const updateSpy = jest
                .spyOn(prismaMock.utilisateur, 'update')
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                .mockResolvedValue({} as any);

            const result = await service.confirmEmail('token-valide');

            expect(result.message).toContain('confirmé');
            expect(updateSpy).toHaveBeenCalledWith({
                where: { id: 'uuid' },
                data: {
                    is_actif: true,
                    email_confirmation_token: null,
                    token_expires_at: null,
                },
            });
        });
    });

    describe('login', () => {
        it('devrait lever UnauthorizedException si email inconnu', async () => {
            const prismaMock = module.get<PrismaService>(PrismaService);
            jest.spyOn(prismaMock.utilisateur, 'findUnique').mockResolvedValue(
                null,
            );

            await expect(
                service.login(
                    { email: 'inconnu@gmail.com', password: 'mdp' },
                    mockRes(),
                ),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('devrait lever UnauthorizedException si mot de passe incorrect', async () => {
            const prismaMock = module.get<PrismaService>(PrismaService);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            jest.spyOn(prismaMock.utilisateur, 'findUnique').mockResolvedValue({
                id: 'uuid',
                email: 'test@gmail.com',
                password_hash: await bcrypt.hash('bon-mot-de-passe', 12),
                is_actif: true,
            } as any);

            await expect(
                service.login(
                    { email: 'test@gmail.com', password: 'mauvais-mdp' },
                    mockRes(),
                ),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('devrait lever ForbiddenException si compte non confirmé', async () => {
            const prismaMock = module.get<PrismaService>(PrismaService);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            jest.spyOn(prismaMock.utilisateur, 'findUnique').mockResolvedValue({
                id: 'uuid',
                email: 'test@gmail.com',
                password_hash: await bcrypt.hash('motdepasse123', 12),
                is_actif: false, // ← compte non confirmé
            } as any);

            await expect(
                service.login(
                    { email: 'test@gmail.com', password: 'motdepasse123' },
                    mockRes(),
                ),
            ).rejects.toThrow(ForbiddenException);
        });

        it('devrait retourner userId et role si credentials valides', async () => {
            const prismaMock = module.get<PrismaService>(PrismaService);
            const jwtMock = module.get<JwtService>(JwtService);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            jest.spyOn(prismaMock.utilisateur, 'findUnique').mockResolvedValue({
                id: 'uuid-valide',
                email: 'test@gmail.com',
                password_hash: await bcrypt.hash('motdepasse123', 12),
                is_actif: true,
                role: 'client',
            } as any);

            jest.spyOn(prismaMock.utilisateur, 'update').mockResolvedValue(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                {} as any,
            );
            jest.spyOn(jwtMock, 'sign').mockReturnValue('fake-token' as never);

            const res = mockRes();
            const result = await service.login(
                { email: 'test@gmail.com', password: 'motdepasse123' },
                res,
            );

            expect(result.userId).toBe('uuid-valide');
            expect(result.role).toBe('client');
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(res.cookie).toHaveBeenCalledTimes(2); // access_token + refresh_token
        });
    });

    describe('logout', () => {
        it('devrait effacer le refresh token en base et vider les cookies', async () => {
            const prismaMock = module.get<PrismaService>(PrismaService);

            const updateSpy = jest
                .spyOn(prismaMock.utilisateur, 'update')
                .mockResolvedValue({} as Utilisateur);

            const res = mockRes();
            const result = await service.logout('uuid-utilisateur', res);

            expect(result.message).toContain('Déconnecté');
            expect(updateSpy).toHaveBeenCalledWith({
                where: { id: 'uuid-utilisateur' },
                data: { refresh_token_hash: null },
            });
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(res.clearCookie).toHaveBeenCalledWith('access_token');
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
        });
    });
});
