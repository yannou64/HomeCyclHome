import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CreateCycleInput } from '../dto/input/create-cycle.dto';
import { UpdateCycleInput } from '../dto/input/update-cycle.dto';
import { CycleResponseDto } from '../dto/output/cycle-response.dto';
import { ICyclesRepository } from './cycles.repository.interface';

// Type Prisma retourné quand on include marque et type_cycle
type CycleWithRelations = {
    id: string;
    libelle: string;
    particularite: string | null;
    date_creation: Date;
    utilisateur_id: string;
    marque: { id: string; libelle: string };
    type_cycle: { id: string; libelle: string };
};

// Champs include réutilisés dans chaque requête
const INCLUDE = { marque: true, type_cycle: true } as const;

@Injectable()
export class CyclesPrismaRepository implements ICyclesRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAllByUser(utilisateurId: string): Promise<CycleResponseDto[]> {
        const cycles = await this.prisma.cycle.findMany({
            where: { utilisateur_id: utilisateurId },
            include: INCLUDE,
            orderBy: { date_creation: 'desc' },
        });
        return cycles.map((c) => this.toDto(c));
    }

    async findById(id: string): Promise<CycleResponseDto | null> {
        const cycle = await this.prisma.cycle.findUnique({
            where: { id },
            include: INCLUDE,
        });
        return cycle ? this.toDto(cycle) : null;
    }

    async create(
        utilisateurId: string,
        data: CreateCycleInput,
    ): Promise<CycleResponseDto> {
        const cycle = await this.prisma.cycle.create({
            data: {
                libelle: data.libelle,
                utilisateur_id: utilisateurId,
                marque_id: data.marqueId,
                type_cycle_id: data.typeCycleId,
                particularite: data.particularite ?? null,
            },
            include: INCLUDE,
        });
        return this.toDto(cycle);
    }

    async update(
        id: string,
        data: UpdateCycleInput,
    ): Promise<CycleResponseDto> {
        const cycle = await this.prisma.cycle.update({
            where: { id },
            data: {
                ...(data.libelle !== undefined && { libelle: data.libelle }),
                ...(data.marqueId && { marque_id: data.marqueId }),
                ...(data.typeCycleId && { type_cycle_id: data.typeCycleId }),
                ...(data.particularite !== undefined && {
                    particularite: data.particularite,
                }),
            },
            include: INCLUDE,
        });
        return this.toDto(cycle);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.cycle.delete({ where: { id } });
    }

    private toDto(cycle: CycleWithRelations): CycleResponseDto {
        return {
            id: cycle.id,
            libelle: cycle.libelle,
            particularite: cycle.particularite,
            dateCreation: cycle.date_creation,
            utilisateurId: cycle.utilisateur_id,
            marque: cycle.marque,
            typeCycle: cycle.type_cycle,
        };
    }
}
