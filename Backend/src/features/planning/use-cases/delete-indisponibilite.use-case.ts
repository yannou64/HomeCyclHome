import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';

@Injectable()
export class DeleteIndisponibiliteUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(id: string): Promise<void> {
        const indispo = await this.repo.findIndisponibiliteById(id);
        if (!indispo) {
            throw new NotFoundException(`Indisponibilité introuvable : ${id}`);
        }
        await this.repo.deleteIndisponibilite(id);
    }
}
