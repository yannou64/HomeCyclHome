import { AdminStatsDto } from '../dto/admin-stats.dto';

export interface IAdminStatsRepository {
    getStats(): Promise<AdminStatsDto>;
}
