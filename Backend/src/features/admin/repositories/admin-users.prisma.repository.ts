import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, Utilisateur } from '../../../../generated/prisma';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AdminUserDto } from '../dto/admin-user.dto';
import {
    CreateAdminUserData,
    FindManyUsersParams,
    IAdminUsersRepository,
    UpdateAdminUserData,
} from './admin-users.repository.interface';

@Injectable()
export class AdminUsersPrismaRepository implements IAdminUsersRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findMany({
        page,
        limit,
        search,
        role,
        isActif,
    }: FindManyUsersParams): Promise<{ users: AdminUserDto[]; total: number }> {
        const where: Prisma.UtilisateurWhereInput = {
            AND: [
                search
                    ? {
                          OR: [
                              {
                                  nom: {
                                      contains: search,
                                      mode: 'insensitive',
                                  },
                              },
                              {
                                  prenom: {
                                      contains: search,
                                      mode: 'insensitive',
                                  },
                              },
                              {
                                  email: {
                                      contains: search,
                                      mode: 'insensitive',
                                  },
                              },
                          ],
                      }
                    : {},
                role ? { role } : {},
                isActif !== undefined ? { is_actif: isActif } : {},
            ],
        };

        // $transaction parallèle : findMany + count partagent le même snapshot BDD
        const [users, total] = await this.prisma.$transaction([
            this.prisma.utilisateur.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { date_creation: 'desc' },
            }),
            this.prisma.utilisateur.count({ where }),
        ]);

        return { users: users.map((u) => this.toDto(u)), total };
    }

    async findById(id: string): Promise<AdminUserDto | null> {
        const user = await this.prisma.utilisateur.findUnique({
            where: { id },
        });
        return user ? this.toDto(user) : null;
    }

    async findByEmail(email: string): Promise<AdminUserDto | null> {
        const user = await this.prisma.utilisateur.findUnique({
            where: { email },
        });
        return user ? this.toDto(user) : null;
    }

    async create(data: CreateAdminUserData): Promise<AdminUserDto> {
        // Le hashage appartient à l'infrastructure — le UseCase ne sait pas comment le mot de passe est stocké
        const password_hash = await bcrypt.hash(data.password, 10);

        const user = await this.prisma.utilisateur.create({
            data: {
                nom: data.nom,
                prenom: data.prenom,
                email: data.email,
                telephone: data.telephone,
                role: data.role,
                password_hash,
                is_actif: true, // créé par un admin → actif immédiatement, sans confirmation email
            },
        });

        return this.toDto(user);
    }

    async update(id: string, data: UpdateAdminUserData): Promise<AdminUserDto> {
        const user = await this.prisma.utilisateur.update({
            where: { id },
            data,
        });
        return this.toDto(user);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.utilisateur.delete({ where: { id } });
    }

    // Garantit qu'on n'expose jamais password_hash ni refresh_token_hash
    private toDto(user: Utilisateur): AdminUserDto {
        return {
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            telephone: user.telephone,
            role: user.role,
            isActif: user.is_actif,
            dateCreation: user.date_creation,
        };
    }
}
