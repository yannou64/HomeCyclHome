import {
    BadRequestException,
    Inject,
    NotFoundException,
} from '@nestjs/common';
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
        if (dto.heure_fin <= dto.heure_debut) {
            throw new BadRequestException(
                "L'heure de fin doit être strictement supérieure à l'heure de début.",
            );
        }

        const technicienExiste = await this.repo.technicienExists(dto.technicien_id);
        if (!technicienExiste) {
            throw new NotFoundException(
                `Technicien introuvable : ${dto.technicien_id}`,
            );
        }

        return this.repo.createPause({
            technicien_id: dto.technicien_id,
            jour_semaine: dto.jour_semaine ?? null,
            heure_debut: dto.heure_debut,
            heure_fin: dto.heure_fin,
            description: dto.description ?? null,
        });
    }
}