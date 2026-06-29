import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CreatePauseRecurrenteDto } from '../dto/create-pause-recurrente.dto';
import { PauseRecurrenteDto } from '../dto/planning.dto';
import {
    IPlanningRepository,
    PLANNING_REPO,
} from '../repositories/planning.repository.interface';

export class CreatePauseRecurrenteUseCase {
    constructor(
        @Inject(PLANNING_REPO)
        private readonly repo: IPlanningRepository,
    ) {}

    async execute(dto: CreatePauseRecurrenteDto): Promise<PauseRecurrenteDto> {
        if (dto.heureFin <= dto.heureDebut) {
            throw new BadRequestException(
                "L'heure de fin doit être strictement supérieure à l'heure de début.",
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

        return this.repo.createPause({
            technicienId: dto.technicienId,
            jourSemaine: dto.jourSemaine ?? null,
            heureDebut: dto.heureDebut,
            heureFin: dto.heureFin,
            description: dto.description ?? null,
        });
    }
}
