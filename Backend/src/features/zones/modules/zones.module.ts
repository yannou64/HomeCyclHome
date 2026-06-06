import { Module } from '@nestjs/common';
import { AdminZonesController } from '../controllers/admin-zones.controller';
import { ZonesController } from '../controllers/zones.controller';
import { ZonesPrismaRepository } from '../repositories/zones.prisma.repository';
import { ZONES_REPO } from '../repositories/zones.repository.interface';
import { CheckZoneUseCase } from '../use-cases/check-zone.use-case';
import { CreateZoneUseCase } from '../use-cases/create-zone.use-case';
import { DeleteZoneUseCase } from '../use-cases/delete-zone.use-case';
import { GetZoneByIdUseCase } from '../use-cases/get-zone-by-id.use-case';
import { GetZonesUseCase } from '../use-cases/get-zones.use-case';
import { UpdateZoneUseCase } from '../use-cases/update-zone.use-case';

@Module({
    controllers: [AdminZonesController, ZonesController],
    providers: [
        {
            provide: ZONES_REPO,
            useClass: ZonesPrismaRepository,
        },
        {
            provide: GetZonesUseCase,
            useFactory: (repo: ZonesPrismaRepository) =>
                new GetZonesUseCase(repo),
            inject: [ZONES_REPO],
        },
        {
            provide: GetZoneByIdUseCase,
            useFactory: (repo: ZonesPrismaRepository) =>
                new GetZoneByIdUseCase(repo),
            inject: [ZONES_REPO],
        },
        {
            provide: CreateZoneUseCase,
            useFactory: (repo: ZonesPrismaRepository) =>
                new CreateZoneUseCase(repo),
            inject: [ZONES_REPO],
        },
        {
            provide: UpdateZoneUseCase,
            useFactory: (repo: ZonesPrismaRepository) =>
                new UpdateZoneUseCase(repo),
            inject: [ZONES_REPO],
        },
        {
            provide: DeleteZoneUseCase,
            useFactory: (repo: ZonesPrismaRepository) =>
                new DeleteZoneUseCase(repo),
            inject: [ZONES_REPO],
        },
        {
            provide: CheckZoneUseCase,
            useFactory: (repo: ZonesPrismaRepository) =>
                new CheckZoneUseCase(repo),
            inject: [ZONES_REPO],
        },
    ],
})
export class ZonesModule {}
