import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateIndisponibiliteDto } from '../dto/input/create-indisponibilite.dto';
import { IndisponibiliteResponseDto } from '../dto/output/indisponibilite-response.dto';
import { IPlanningRepository } from '../repositories/planning.repository.interface';

export class CreateIndisponibiliteUseCase {
    constructor(private readonly repo: IPlanningRepository) {}

    async execute(
        dto: CreateIndisponibiliteDto,
    ): Promise<IndisponibiliteResponseDto> {
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
