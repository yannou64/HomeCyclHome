import type {
    IInterventionsRepository,
    GetAdminInterventionsParams,
} from '../repositories/interventions.repository.interface';
import type { PaginatedAdminInterventionsDto } from '../dto/output/paginated-admin-interventions.dto';

export class GetAdminInterventionsUseCase {
    constructor(private readonly repo: IInterventionsRepository) {}

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
