import { Module } from '@nestjs/common';
import { DatabaseModule } from '../shared/database/database.module';
import { AuthModule } from '../features/auth/modules/auth.module';
import { UsersModule } from '../features/users/modules/users.module';
import { AdminModule } from '../features/admin/modules/admin.module';
import { MarquesModule } from '../features/referentiel/marques/modules/admin-marques.module';
import { TypeCyclesModule } from '../features/referentiel/type-cycles/modules/admin-type-cycles.module';
import { CycleModule } from '../features/cycle/modules/cycle.module';
import { ForfaitsModule } from '../features/forfaits/modules/forfaits.module';
import { ZonesModule } from '../features/zones/modules/zones.module';
import { AffectationsModule } from '../features/affectations/affectations.module';
import { PlanningModule } from '../features/planning/planning.module';

@Module({
    imports: [
        DatabaseModule,
        AuthModule,
        UsersModule,
        AdminModule,
        MarquesModule,
        TypeCyclesModule,
        CycleModule,
        ForfaitsModule,
        ZonesModule,
        AffectationsModule,
        PlanningModule,
    ],
})
export class AppModule {}
