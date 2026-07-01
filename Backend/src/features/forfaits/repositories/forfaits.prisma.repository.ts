import { Injectable } from '@nestjs/common';
import { Forfait, Prisma } from '../../../../generated/prisma';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { ForfaitDto } from '../dto/forfait.dto';
import {
    CreateForfaitData,
    IForfaitsRepository,
    UpdateForfaitData,
} from './forfaits.repository.interface';

type ForfaitWithPrix = Forfait & {
    historique_prix?: Array<{ montant: Prisma.Decimal }>;
};

@Injectable()
export class ForfaitsPrismaRepository implements IForfaitsRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<ForfaitDto[]> {
        const forfaits = await this.prisma.forfait.findMany({
            orderBy: { nom: 'asc' },
            include: {
                historique_prix: {
                    where: { date_fin: null },
                    take: 1,
                },
            },
        });
        return forfaits.map((f) => this.toDto(f));
    }

    async findAllActifs(): Promise<ForfaitDto[]> {
        const forfaits = await this.prisma.forfait.findMany({
            where: { is_actif: true },
            orderBy: { nom: 'asc' },
            include: {
                historique_prix: {
                    where: { date_fin: null },
                    take: 1,
                },
            },
        });
        return forfaits.map((f) => this.toDto(f));
    }

    async findById(id: string): Promise<ForfaitDto | null> {
        const forfait = await this.prisma.forfait.findUnique({
            where: { id },
            include: {
                historique_prix: {
                    where: { date_fin: null },
                    take: 1,
                },
            },
        });
        return forfait ? this.toDto(forfait) : null;
    }

    async findByNom(nom: string): Promise<ForfaitDto | null> {
        const forfait = await this.prisma.forfait.findUnique({
            where: { nom },
        });
        return forfait ? this.toDto(forfait) : null;
    }

    async create(data: CreateForfaitData): Promise<ForfaitDto> {
        const forfait = await this.prisma.forfait.create({
            data: {
                nom: data.nom,
                description: data.description,
                duree_minutes: data.dureeMinutes,
                is_actif: data.isActif ?? true,
            },
        });
        return this.toDto(forfait);
    }

    async update(id: string, data: UpdateForfaitData): Promise<ForfaitDto> {
        const forfait = await this.prisma.forfait.update({
            where: { id },
            data: {
                nom: data.nom,
                description: data.description,
                ...(data.dureeMinutes !== undefined && {
                    duree_minutes: data.dureeMinutes,
                }),
                ...(data.isActif !== undefined && { is_actif: data.isActif }),
            },
        });
        return this.toDto(forfait);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.forfait.delete({ where: { id } });
    }

    async setPrix(
        forfaitId: string,
        montant: number,
        dateDebut: Date,
    ): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            await tx.historiquePrixForfait.updateMany({
                where: { forfait_id: forfaitId, date_fin: null },
                data: { date_fin: dateDebut },
            });
            await tx.historiquePrixForfait.create({
                data: { forfait_id: forfaitId, montant, date_debut: dateDebut },
            });
        });
    }

    private toDto(forfait: ForfaitWithPrix): ForfaitDto {
        return {
            id: forfait.id,
            nom: forfait.nom,
            description: forfait.description,
            dureeMinutes: forfait.duree_minutes,
            isActif: forfait.is_actif,
            prixActif: forfait.historique_prix?.[0]
                ? Number(forfait.historique_prix[0].montant)
                : null,
        };
    }
}
