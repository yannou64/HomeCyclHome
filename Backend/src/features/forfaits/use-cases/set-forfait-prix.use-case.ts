import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FORFAITS_REPO } from '../modules/forfaits.module';
import { IForfaitsRepository } from '../repositories/forfaits.repository.interface';

@Injectable()
export class SetForfaitPrixUseCase {
    constructor(
        @Inject(FORFAITS_REPO)
        private readonly repo: IForfaitsRepository,
    ) {}

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
