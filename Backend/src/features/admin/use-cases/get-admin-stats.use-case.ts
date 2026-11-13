import { AdminStatsResponseDto } from '../dto/output/admin-stats-response.dto';
import { IAdminStatsRepository } from '../repositories/admin-stats.repository.interface';

export class GetAdminStatsUseCase {
    constructor(private readonly repo: IAdminStatsRepository) {}

    execute(): Promise<AdminStatsResponseDto> {
        return this.repo.getStats();
    }
}
