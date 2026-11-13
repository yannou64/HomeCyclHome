import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateCycleInput } from '../dto/input/update-cycle.dto';
import { CycleResponseDto } from '../dto/output/cycle-response.dto';
import { ICyclesRepository } from '../repositories/cycles.repository.interface';

export class UpdateCycleUseCase {
    constructor(private readonly repo: ICyclesRepository) {}

    async execute(
        id: string,
        utilisateurId: string,
        data: UpdateCycleInput,
    ): Promise<CycleResponseDto> {
        const cycle = await this.repo.findById(id);

        if (!cycle) {
            throw new NotFoundException(`Cycle introuvable`);
        }

        // Règle métier : un client ne peut modifier que ses propres cycles
        if (cycle.utilisateurId !== utilisateurId) {
            throw new ForbiddenException(`Accès refusé`);
        }

        return this.repo.update(id, data);
    }
}
