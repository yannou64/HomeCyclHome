import { Injectable, Inject } from '@nestjs/common';
import {
    INTERVENTIONS_REPO,
    type IInterventionsRepository,
} from '../repositories/interventions.repository.interface';
import type { InterventionListItemResponseDto } from '../dto/output/intervention-list-item-response.dto';

@Injectable()
export class GetClientInterventionsUseCase {
    constructor(
        @Inject(INTERVENTIONS_REPO)
        private readonly repo: IInterventionsRepository,
    ) {}

    async execute(
        clientId: string,
    ): Promise<InterventionListItemResponseDto[]> {
        return this.repo.getInterventionsByClientId(clientId);
    }
}
