import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CreateIndisponibiliteDto } from '../dto/create-indisponibilite.dto';
import { IndisponibiliteDto } from '../dto/planning.dto';
import {
    IPlanningRepository,
    PLANNING_REPO,
} from '../repositories/planning.repository.interface';

export class CreateIndisponibiliteUseCase {
    constructor(
        @Inject(PLANNING_REPO)
        private readonly repo: IPlanningRepository,
    ) {}

    async execute(dto: CreateIndisponibiliteDto): Promise<IndisponibiliteDto> {
        const dateDebut = new Date(dto.dateDebut);
        const dateFin = new Date(dto.dateFin);

        if (dateFin <= dateDebut) {
            throw new BadRequestException(
                'La date de fin doit être strictement postérieure à la date de début.',
            );
        }

        const technicienExiste = await this.repo.technicienExists(
            dto.technicienId,
        );
        if (!technicienExiste) {
            throw new NotFoundException(
                `Technicien introuvable : ${dto.technicienId}`,
            );
        }

        return this.repo.createIndisponibilite({
            technicienId: dto.technicienId,
            dateDebut: dateDebut,
            dateFin: dateFin,
            motif: dto.motif,
        });
    }
}
