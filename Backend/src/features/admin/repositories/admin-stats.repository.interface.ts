import { AdminStatsResponseDto } from '../dto/output/admin-stats-response.dto';

export interface IAdminStatsRepository {
    getStats(): Promise<AdminStatsResponseDto>;
}
