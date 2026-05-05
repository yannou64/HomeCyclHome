import { ConflictException, NotFoundException } from '@nestjs/common';
import { ForfaitDto } from '../dto/forfait.dto';
import {
    IForfaitsRepository,
    UpdateForfaitData,
} from '../repositories/forfaits.repository.interface';

export class UpdateForfaitUseCase {
    constructor(private readonly repo: IForfaitsRepository) {}

    async execute(id: string, data: UpdateForfaitData): Promise<ForfaitDto> {
        const forfait = await this.repo.findById(id);
        if (!forfait) {
            throw new NotFoundException(`Forfait avec l'id ${id} introuvable`);
        }

        if (data.nom) {
            const nomOwner = await this.repo.findByNom(data.nom);
            // Conflit uniquement si le nom appartient à un AUTRE forfait
            if (nomOwner && nomOwner.id !== id) {
                throw new ConflictException(
                    `Un forfait avec le nom "${data.nom}" existe déjà`,
                );
            }
        }

        return this.repo.update(id, data);
    }
}