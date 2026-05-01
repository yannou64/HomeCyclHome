import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { MarqueDto } from '../dto/marque.dto';
import { IMarquesRepository } from './marques.repository.interface';

@Injectable()
export class MarquesPrismaRepository implements IMarquesRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<MarqueDto[]> {
        const marques = await this.prisma.marque.findMany({
            orderBy: { libelle: 'asc' },
        });
        return marques.map((m) => this.toDto(m));
    }

    async findById(id: string): Promise<MarqueDto | null> {
        const marque = await this.prisma.marque.findUnique({ where: { id } });
        return marque ? this.toDto(marque) : null;
    }

    async findByLibelle(libelle: string): Promise<MarqueDto | null> {
        const marque = await this.prisma.marque.findUnique({
            where: { libelle },
        });
        return marque ? this.toDto(marque) : null;
    }

    async create(libelle: string): Promise<MarqueDto> {
        const marque = await this.prisma.marque.create({ data: { libelle } });
        return this.toDto(marque);
    }

    async update(id: string, libelle: string): Promise<MarqueDto> {
        const marque = await this.prisma.marque.update({
            where: { id },
            data: { libelle },
        });
        return this.toDto(marque);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.marque.delete({ where: { id } });
    }

    private toDto(marque: { id: string; libelle: string }): MarqueDto {
        return { id: marque.id, libelle: marque.libelle };
    }
}
