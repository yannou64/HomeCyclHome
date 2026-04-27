import { ConflictException, NotFoundException } from '@nestjs/common';
import { MarqueDto } from '../dto/marque.dto';
import { IMarquesRepository } from '../repositories/marques.repository.interface';

export class UpdateMarqueUseCase {
    constructor(private readonly repo: IMarquesRepository) {}

    async execute(id: string, libelle: string): Promise<MarqueDto> {
        const marque = await this.repo.findById(id);
        if (!marque) {
            throw new NotFoundException(`Marque avec l'id ${id} introuvable`);
        }

        const existing = await this.repo.findByLibelle(libelle);
        if (existing && existing.id !== id) {
            throw new ConflictException(`La marque "${libelle}" existe déjà`);
        }

        return this.repo.update(id, libelle);
    }
}
