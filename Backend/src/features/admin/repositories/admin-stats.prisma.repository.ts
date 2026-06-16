import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AdminStatsDto } from '../dto/admin-stats.dto';
import { IAdminStatsRepository } from './admin-stats.repository.interface';

@Injectable()
export class AdminStatsPrismaRepository implements IAdminStatsRepository {
    constructor(private readonly prisma: PrismaService) {}

    async getStats(): Promise<AdminStatsDto> {
        const [interventionsPlanifiees, zonesCouvertes, nombreTechniciens] =
            await Promise.all([
                this.prisma.intervention.count({
                    where: { statut: 'Planifiee' },
                }),
                this.prisma.zone.count({ where: { is_active: true } }),
                this.prisma.utilisateur.count({
                    where: { role: 'technicien', is_actif: true },
                }),
            ]);

        return { interventionsPlanifiees, zonesCouvertes, nombreTechniciens };
    }
}
