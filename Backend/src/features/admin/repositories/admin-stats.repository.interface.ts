import { AdminStatsResponseDto } from '../dto/output/admin-stats-response.dto';

// Jeton d'injection : l'interface disparaît à la compilation, Nest
// retrouve l'implémentation par ce nom (voir le module).
export const ADMIN_STATS_REPO = 'ADMIN_STATS_REPO';

export interface IAdminStatsRepository {
    getStats(): Promise<AdminStatsResponseDto>;
}
