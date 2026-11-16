import { Injectable, Inject } from '@nestjs/common';
import {
    INTERVENTIONS_REPO,
    type IInterventionsRepository,
    type GetAdminInterventionsParams,
} from '../repositories/interventions.repository.interface';
import type { PaginatedAdminInterventionsResponseDto } from '../dto/output/paginated-admin-interventions-response.dto';

@Injectable()
export class GetAdminInterventionsUseCase {
    constructor(
        @Inject(INTERVENTIONS_REPO)
        private readonly repo: IInterventionsRepository,
    ) {}

    async execute(
        params: GetAdminInterventionsParams,
    ): Promise<PaginatedAdminInterventionsResponseDto> {
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
