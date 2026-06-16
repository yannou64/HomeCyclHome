import { AdminStatsDto } from '../dto/admin-stats.dto';
import { IAdminStatsRepository } from '../repositories/admin-stats.repository.interface';

export class GetAdminStatsUseCase {
    constructor(private readonly repo: IAdminStatsRepository) {}

    execute(): Promise<AdminStatsDto> {
        return this.repo.getStats();
    }
}
