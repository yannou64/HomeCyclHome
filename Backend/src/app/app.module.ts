import { Module } from '@nestjs/common';
import { DatabaseModule } from '../shared/database/database.module';
import { AuthModule } from '../features/auth/auth.module';
import { UsersModule } from '../features/users/users.module';
import { AdminModule } from '../features/admin/admin.module';
import { MarquesModule } from '../features/referentiel/marques/admin-marques.module';
import { TypeCyclesModule } from '../features/referentiel/type-cycles/admin-type-cycles.module';
import { CycleModule } from '../features/cycle/cycle.module';
import { ForfaitsModule } from '../features/forfaits/forfaits.module';
import { ZonesModule } from '../features/zones/zones.module';
import { AffectationsModule } from '../features/affectations/affectations.module';
import { PlanningModule } from '../features/planning/planning.module';
import { AdressesModule } from '../features/adresses/adresses.module';
import { InterventionModule } from '../features/intervention/intervention.module';

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
        AdressesModule,
        InterventionModule,
    ],
})
export class AppModule {}
