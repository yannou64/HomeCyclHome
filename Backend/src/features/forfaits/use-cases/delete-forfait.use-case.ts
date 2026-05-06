import { NotFoundException } from '@nestjs/common';
import { IForfaitsRepository } from '../repositories/forfaits.repository.interface';

export class DeleteForfaitUseCase {
    constructor(private readonly repo: IForfaitsRepository) {}

    async execute(id: string): Promise<void> {
        const forfait = await this.repo.findById(id);
        if (!forfait) {
            throw new NotFoundException(`Forfait avec l'id ${id} introuvable`);
        }
        await this.repo.delete(id);
    }
}
