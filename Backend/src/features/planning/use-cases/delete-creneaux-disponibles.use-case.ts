import { BadRequestException, Inject } from '@nestjs/common';
import {
    IPlanningRepository,
    PLANNING_REPO,
} from '../repositories/planning.repository.interface';

export type DeleteCreneauxDisponiblesInput = {
    technicienId: string;
    dateDebut: string;
    dateFin: string;
};

export class DeleteCreneauxDisponiblesUseCase {
    constructor(
        @Inject(PLANNING_REPO)
        private readonly repo: IPlanningRepository,
    ) {}

    async execute(
        input: DeleteCreneauxDisponiblesInput,
    ): Promise<{ deleted: number }> {
        if (!input.technicienId) {
            throw new BadRequestException('technicienId est requis.');
        }

        const debut = new Date(input.dateDebut);
        debut.setUTCHours(0, 0, 0, 0);

        const fin = new Date(input.dateFin);
        fin.setUTCHours(23, 59, 59, 999);

        if (fin < debut) {
            throw new BadRequestException(
                'La date de fin doit être postérieure ou égale à la date de début.',
            );
        }

        const deleted = await this.repo.deleteCreneauxDisponibles(
            input.technicienId,
            debut,
            fin,
        );

        return { deleted };
    }
}
