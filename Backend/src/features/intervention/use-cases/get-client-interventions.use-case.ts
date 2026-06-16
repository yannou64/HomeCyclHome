import type { IInterventionsRepository } from '../repositories/interventions.repository.interface';
import type { InterventionListItemDto } from '../dto/output/intervention-list-item.dto';

export class GetClientInterventionsUseCase {
    constructor(private readonly repo: IInterventionsRepository) {}

    async execute(clientId: string): Promise<InterventionListItemDto[]> {
        return this.repo.getInterventionsByClientId(clientId);
    }
}
