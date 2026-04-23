import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../../shared/prisma/prisma.service';

// Représente un utilisateur complet tel que Prisma le retourne
const utilisateurMock = {
    id: 'uuid-test',
    nom: 'Biot',
    prenom: 'Yannick',
    email: 'yannick@test.com',
    telephone: '0612345678',
    role: 'client' as const,
    password_hash: 'hash',
    refresh_token_hash: null,
    is_actif: true,
    email_confirmation_token: null,
    token_expires_at: null,
    date_creation: new Date(),
    date_maj: new Date(),
    date_dernier_login: null,
};

describe('UsersService', () => {
    let service: UsersService;
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: PrismaService,
                    useValue: {
                        utilisateur: {
                            findUnique: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ─── getProfile ───────────────────────────────────────────────

    describe('getProfile', () => {
        it('devrait retourner le profil si utilisateur trouvé', async () => {
            // ARRANGE — Prisma trouve l'utilisateur
            const prisma = module.get<PrismaService>(PrismaService);
            jest.spyOn(prisma.utilisateur, 'findUnique').mockResolvedValue(
                utilisateurMock,
            );

            // ACT
            const result = await service.getProfile('uuid-test');

            // ASSERT — on reçoit les champs attendus, jamais le hash
            expect(result.id).toBe('uuid-test');
            expect(result.prenom).toBe('Yannick');
            expect(result.email).toBe('yannick@test.com');
            expect(result).not.toHaveProperty('password_hash');
        });

        it('devrait lever NotFoundException si utilisateur introuvable', async () => {
            // ARRANGE — Prisma retourne null (utilisateur inconnu)
            const prisma = module.get<PrismaService>(PrismaService);
            jest.spyOn(prisma.utilisateur, 'findUnique').mockResolvedValue(
                null,
            );

            // ACT + ASSERT
            await expect(service.getProfile('uuid-inconnu')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    // ─── updateProfile ────────────────────────────────────────────

    describe('updateProfile', () => {
        it('devrait retourner le profil mis à jour', async () => {
            // ARRANGE — update retourne l'utilisateur avec le prénom modifié
            const prisma = module.get<PrismaService>(PrismaService);
            jest.spyOn(prisma.utilisateur, 'update').mockResolvedValue({
                ...utilisateurMock,
                prenom: 'Jean',
            });

            // ACT
            const result = await service.updateProfile('uuid-test', {
                prenom: 'Jean',
            });

            // ASSERT
            expect(result.prenom).toBe('Jean');
            expect(result).not.toHaveProperty('password_hash');
        });

        it('devrait lever NotFoundException si utilisateur introuvable', async () => {
            // ARRANGE — Prisma lève une erreur P2025 (record not found)
            const prisma = module.get<PrismaService>(PrismaService);
            jest.spyOn(prisma.utilisateur, 'update').mockRejectedValue(
                Object.assign(new Error(), { code: 'P2025' }),
            );

            // ACT + ASSERT
            await expect(
                service.updateProfile('uuid-inconnu', { nom: 'Test' }),
            ).rejects.toThrow(NotFoundException);
        });

        it("devrait n'envoyer que les champs fournis à Prisma (patch partiel)", async () => {
            // ARRANGE
            const prisma = module.get<PrismaService>(PrismaService);
            const updateSpy = jest
                .spyOn(prisma.utilisateur, 'update')
                .mockResolvedValue({
                    ...utilisateurMock,
                    telephone: '0698765432',
                });

            // ACT — on ne passe que le téléphone
            await service.updateProfile('uuid-test', {
                telephone: '0698765432',
            });

            // ASSERT — Prisma reçoit bien le téléphone dans data (les autres champs undefined sont ignorés)
            expect(updateSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    data: expect.objectContaining({ telephone: '0698765432' }),
                }),
            );
        });
    });
});
