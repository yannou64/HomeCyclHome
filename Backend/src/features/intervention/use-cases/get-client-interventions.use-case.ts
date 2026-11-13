import type { IInterventionsRepository } from '../repositories/interventions.repository.interface';
import type { InterventionListItemResponseDto } from '../dto/output/intervention-list-item-response.dto';

export class GetClientInterventionsUseCase {
    constructor(private readonly repo: IInterventionsRepository) {}

    async execute(
        clientId: string,
    ): Promise<InterventionListItemResponseDto[]> {
        return this.repo.getInterventionsByClientId(clientId);
    }
}
