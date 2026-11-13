import { AdminStatsResponseDto } from '../dto/output/admin-stats-response.dto';
import { IAdminStatsRepository } from '../repositories/admin-stats.repository.interface';
import { GetAdminStatsUseCase } from './get-admin-stats.use-case';

describe('GetAdminStatsUseCase', () => {
    let useCase: GetAdminStatsUseCase;
    let mockRepo: jest.Mocked<IAdminStatsRepository>;

    beforeEach(() => {
        mockRepo = {
            getStats: jest.fn(),
        };
        useCase = new GetAdminStatsUseCase(mockRepo);
    });

    it('devrait retourner les statistiques fournies par le repository', async () => {
        const stats: AdminStatsResponseDto = {
            interventionsPlanifiees: 5,
            zonesCouvertes: 3,
            nombreTechniciens: 2,
        };
        mockRepo.getStats.mockResolvedValue(stats);

        const result = await useCase.execute();

        expect(result).toEqual(stats);
    });

    it('devrait déléguer au repository sans modifier les données', async () => {
        const stats: AdminStatsResponseDto = {
            interventionsPlanifiees: 0,
            zonesCouvertes: 0,
            nombreTechniciens: 0,
        };
        mockRepo.getStats.mockResolvedValue(stats);

        await useCase.execute();

        expect(mockRepo.getStats).toHaveBeenCalledTimes(1);
        expect(mockRepo.getStats).toHaveBeenCalledWith();
    });
});
