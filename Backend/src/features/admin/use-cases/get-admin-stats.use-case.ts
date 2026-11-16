import { Injectable, Inject } from '@nestjs/common';
import { AdminStatsResponseDto } from '../dto/output/admin-stats-response.dto';
import {
    ADMIN_STATS_REPO,
    type IAdminStatsRepository,
} from '../repositories/admin-stats.repository.interface';

@Injectable()
export class GetAdminStatsUseCase {
    constructor(
        @Inject(ADMIN_STATS_REPO) private readonly repo: IAdminStatsRepository,
    ) {}

    execute(): Promise<AdminStatsResponseDto> {
        return this.repo.getStats();
    }
}
