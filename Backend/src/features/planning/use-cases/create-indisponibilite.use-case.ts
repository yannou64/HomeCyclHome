import {
    BadRequestException,
    Inject,
    NotFoundException,
} from '@nestjs/common';
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
        const dateDebut = new Date(dto.date_debut);
        const dateFin = new Date(dto.date_fin);

        if (dateFin <= dateDebut) {
            throw new BadRequestException(
                'La date de fin doit être strictement postérieure à la date de début.',
            );
        }

        const technicienExiste = await this.repo.technicienExists(dto.technicien_id);
        if (!technicienExiste) {
            throw new NotFoundException(
                `Technicien introuvable : ${dto.technicien_id}`,
            );
        }

        return this.repo.createIndisponibilite({
            technicien_id: dto.technicien_id,
            date_debut: dateDebut,
            date_fin: dateFin,
            motif: dto.motif,
        });
    }
}