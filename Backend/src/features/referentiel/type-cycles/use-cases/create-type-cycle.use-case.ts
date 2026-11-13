import { ConflictException } from '@nestjs/common';
import { TypeCycleResponseDto } from '../dto/output/type-cycle-response.dto';
import { ITypeCyclesRepository } from '../repositories/type-cycles.repository.interface';

export class CreateTypeCycleUseCase {
    constructor(private readonly repo: ITypeCyclesRepository) {}

    async execute(libelle: string): Promise<TypeCycleResponseDto> {
        const existing = await this.repo.findByLibelle(libelle);
        if (existing) {
            throw new ConflictException(
                `Le type de cycle "${libelle}" existe déjà`,
            );
        }
        return this.repo.create(libelle);
    }
}
