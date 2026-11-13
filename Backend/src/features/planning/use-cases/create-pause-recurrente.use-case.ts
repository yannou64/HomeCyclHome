import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePauseRecurrenteDto } from '../dto/input/create-pause-recurrente.dto';
import { PauseRecurrenteResponseDto } from '../dto/output/pause-recurrente-response.dto';
import { IPlanningRepository } from '../repositories/planning.repository.interface';

export class CreatePauseRecurrenteUseCase {
    constructor(private readonly repo: IPlanningRepository) {}

    async execute(
        dto: CreatePauseRecurrenteDto,
    ): Promise<PauseRecurrenteResponseDto> {
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
