import {
    ConflictException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import type { IInterventionsRepository } from '../repositories/interventions.repository.interface';

export class CancelInterventionUseCase {
    constructor(private readonly repo: IInterventionsRepository) {}

    async execute(interventionId: string, clientId: string): Promise<void> {
        const intervention =
            await this.repo.findInterventionForCancel(interventionId);

        if (!intervention) throw new NotFoundException();
        if (intervention.clientId !== clientId) throw new ForbiddenException();
        if (intervention.statut !== 'Planifiee') {
            throw new ConflictException(
                'Seules les interventions planifiées peuvent être annulées.',
            );
        }

        await this.repo.cancelInterventionTransaction(
            interventionId,
            intervention.creneauId,
        );
    }
}
