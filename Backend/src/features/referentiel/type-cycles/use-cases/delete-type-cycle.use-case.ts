import { NotFoundException } from '@nestjs/common';
import { ITypeCyclesRepository } from '../repositories/type-cycles.repository.interface';

export class DeleteTypeCycleUseCase {
    constructor(private readonly repo: ITypeCyclesRepository) {}

    async execute(id: string): Promise<void> {
        const typeCycle = await this.repo.findById(id);
        if (!typeCycle) {
            throw new NotFoundException(
                `Type de cycle avec l'id ${id} introuvable`,
            );
        }
        await this.repo.delete(id);
    }
}
