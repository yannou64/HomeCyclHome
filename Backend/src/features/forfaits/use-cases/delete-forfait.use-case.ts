import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import {
    FORFAITS_REPO,
    type IForfaitsRepository,
} from '../repositories/forfaits.repository.interface';

@Injectable()
export class DeleteForfaitUseCase {
    constructor(
        @Inject(FORFAITS_REPO) private readonly repo: IForfaitsRepository,
    ) {}

    async execute(id: string): Promise<void> {
        const forfait = await this.repo.findById(id);
        if (!forfait) {
            throw new NotFoundException(`Forfait avec l'id ${id} introuvable`);
        }
        await this.repo.delete(id);
    }
}
