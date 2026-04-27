import { ConflictException, NotFoundException } from '@nestjs/common';
import { TypeCycleDto } from '../dto/type-cycle.dto';
import { ITypeCyclesRepository } from '../repositories/type-cycles.repository.interface';

export class UpdateTypeCycleUseCase {
    constructor(private readonly repo: ITypeCyclesRepository) {}

    async execute(id: string, libelle: string): Promise<TypeCycleDto> {
        const typeCycle = await this.repo.findById(id);
        if (!typeCycle) {
            throw new NotFoundException(
                `Type de cycle avec l'id ${id} introuvable`,
            );
        }

        const existing = await this.repo.findByLibelle(libelle);
        if (existing && existing.id !== id) {
            throw new ConflictException(
                `Le type de cycle "${libelle}" existe déjà`,
            );
        }

        return this.repo.update(id, libelle);
    }
}
