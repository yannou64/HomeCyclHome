import { ConflictException } from '@nestjs/common';
import { MarqueDto } from '../dto/marque.dto';
import { IMarquesRepository } from '../repositories/marques.repository.interface';

export class CreateMarqueUseCase {
    constructor(private readonly repo: IMarquesRepository) {}

    async execute(libelle: string): Promise<MarqueDto> {
        const existing = await this.repo.findByLibelle(libelle);
        if (existing) {
            throw new ConflictException(`La marque "${libelle}" existe déjà`);
        }
        return this.repo.create(libelle);
    }
}
