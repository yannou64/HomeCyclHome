import { Inject } from '@nestjs/common';
import { GenerationRapportDto } from '../dto/planning.dto';
import {
    IPlanningRepository,
    PLANNING_REPO,
} from '../repositories/planning.repository.interface';
import { GenerateCreneauxUseCase } from './generate-creneaux.use-case';

export type GenerateAllCreneauxInput = {
    technicienId: string;
    dateFinGeneration?: string;
};

export class GenerateAllCreneauxUseCase {
    constructor(
        @Inject(PLANNING_REPO)
        private readonly repo: IPlanningRepository,
        private readonly generateUseCase: GenerateCreneauxUseCase,
    ) {}

    async execute(
        input: GenerateAllCreneauxInput,
    ): Promise<GenerationRapportDto> {
        const modeles = await this.repo.findModelesByTechnicien(
            input.technicienId,
        );
        const actifs = modeles.filter((m) => m.isActif);

        if (actifs.length === 0) {
            return { created: 0, skipped: 0, conflicts: 0 };
        }

        const rapports = await Promise.all(
            actifs.map((m) =>
                this.generateUseCase.execute({
                    modeleId: m.id,
                    dateFinGeneration: input.dateFinGeneration,
                }),
            ),
        );

        return rapports.reduce(
            (acc, r) => ({
                created: acc.created + r.created,
                skipped: acc.skipped + r.skipped,
                conflicts: acc.conflicts + r.conflicts,
            }),
            { created: 0, skipped: 0, conflicts: 0 },
        );
    }
}
