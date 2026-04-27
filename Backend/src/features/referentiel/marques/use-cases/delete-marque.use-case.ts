import { NotFoundException } from '@nestjs/common';
import { IMarquesRepository } from '../repositories/marques.repository.interface';

export class DeleteMarqueUseCase {
    constructor(private readonly repo: IMarquesRepository) {}

    async execute(id: string): Promise<void> {
        const marque = await this.repo.findById(id);
        if (!marque) {
            throw new NotFoundException(`Marque avec l'id ${id} introuvable`);
        }
        await this.repo.delete(id);
    }
}
