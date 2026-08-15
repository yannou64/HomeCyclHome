import { NotFoundException } from '@nestjs/common';
import { IForfaitsRepository } from '../repositories/forfaits.repository.interface';

export class SetForfaitPrixUseCase {
    constructor(private readonly repo: IForfaitsRepository) {}

    async execute(
        forfaitId: string,
        montant: number,
        dateDebut: Date,
    ): Promise<void> {
        const forfait = await this.repo.findById(forfaitId);
        if (!forfait) throw new NotFoundException('Forfait introuvable');
        await this.repo.setPrix(forfaitId, montant, dateDebut);
    }
}
