import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { TypeCycleResponseDto } from '../dto/output/type-cycle-response.dto';
import { ITypeCyclesRepository } from './type-cycles.repository.interface';

@Injectable()
export class TypeCyclesPrismaRepository implements ITypeCyclesRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<TypeCycleResponseDto[]> {
        const types = await this.prisma.typeCycle.findMany({
            orderBy: { libelle: 'asc' },
        });
        return types.map((t) => this.toDto(t));
    }

    async findById(id: string): Promise<TypeCycleResponseDto | null> {
        const type = await this.prisma.typeCycle.findUnique({ where: { id } });
        return type ? this.toDto(type) : null;
    }

    async findByLibelle(libelle: string): Promise<TypeCycleResponseDto | null> {
        const type = await this.prisma.typeCycle.findUnique({
            where: { libelle },
        });
        return type ? this.toDto(type) : null;
    }

    async create(libelle: string): Promise<TypeCycleResponseDto> {
        const type = await this.prisma.typeCycle.create({ data: { libelle } });
        return this.toDto(type);
    }

    async update(id: string, libelle: string): Promise<TypeCycleResponseDto> {
        const type = await this.prisma.typeCycle.update({
            where: { id },
            data: { libelle },
        });
        return this.toDto(type);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.typeCycle.delete({ where: { id } });
    }

    private toDto(type: { id: string; libelle: string }): TypeCycleResponseDto {
        return { id: type.id, libelle: type.libelle };
    }
}
