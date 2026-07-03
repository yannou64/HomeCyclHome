import { Inject, Injectable } from '@nestjs/common';
import { INTERVENTIONS_REPO } from '../intervention.module';
import type {
    IInterventionsRepository,
    GetAdminInterventionsParams,
} from '../repositories/interventions.repository.interface';
import type { PaginatedAdminInterventionsDto } from '../dto/output/paginated-admin-interventions.dto';

@Injectable()
export class GetAdminInterventionsUseCase {
    constructor(
        @Inject(INTERVENTIONS_REPO)
        private readonly repo: IInterventionsRepository,
    ) {}

    async execute(
        params: GetAdminInterventionsParams,
    ): Promise<PaginatedAdminInterventionsDto> {
        const { interventions, total } =
            await this.repo.findAllInterventions(params);

        return {
            data: interventions,
            meta: {
                total,
                page: params.page,
                limit: params.limit,
                totalPages: Math.ceil(total / params.limit),
            },
        };
    }
}
