import { BadRequestException, Inject } from '@nestjs/common';
import { CreneauDto } from '../dto/planning.dto';
import {
    IPlanningRepository,
    PLANNING_REPO,
} from '../repositories/planning.repository.interface';

export type GetCreneauxInput = {
    technicienId: string;
    dateDebut: string; // ISO date — borne inclusive
    dateFin: string; // ISO date — borne inclusive
};

export class GetCreneauxUseCase {
    constructor(
        @Inject(PLANNING_REPO)
        private readonly repo: IPlanningRepository,
    ) {}

    async execute(input: GetCreneauxInput): Promise<CreneauDto[]> {
        if (!input.technicienId) {
            throw new BadRequestException('Le technicienId est requis.');
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

        return this.repo.findCreneauxByTechnicien(
            input.technicienId,
            debut,
            fin,
        );
    }
}
