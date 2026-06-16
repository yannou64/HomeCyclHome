import { Inject, Injectable } from '@nestjs/common';
import { INTERVENTIONS_REPO } from '../intervention.module';
import type {
    IInterventionsRepository,
    GetAdminInterventionsParams,
} from '../repositories/interventions.repository.interface';
import type { AdminInterventionListItemDto } from '../dto/output/admin-intervention-list-item.dto';

@Injectable()
export class GetAdminInterventionsUseCase {
    constructor(
        @Inject(INTERVENTIONS_REPO)
        private readonly repo: IInterventionsRepository,
    ) {}

    execute(
        params: GetAdminInterventionsParams,
    ): Promise<AdminInterventionListItemDto[]> {
        return this.repo.findAllInterventions(params);
    }
}
