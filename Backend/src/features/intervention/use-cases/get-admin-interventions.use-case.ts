import type {
    IInterventionsRepository,
    GetAdminInterventionsParams,
} from '../repositories/interventions.repository.interface';
import type { PaginatedAdminInterventionsResponseDto } from '../dto/output/paginated-admin-interventions-response.dto';

export class GetAdminInterventionsUseCase {
    constructor(private readonly repo: IInterventionsRepository) {}

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
