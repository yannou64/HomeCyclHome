import { Module } from '@nestjs/common';
import { DatabaseModule } from '../shared/database/database.module';
import { AuthModule } from '../features/auth/modules/auth.module';
import { UsersModule } from '../features/users/modules/users.module';
import { AdminModule } from '../features/admin/modules/admin.module';
import { MarquesModule } from '../features/referentiel/marques/modules/admin-marques.module';
import { TypeCyclesModule } from '../features/referentiel/type-cycles/modules/admin-type-cycles.module';
import { CycleModule } from '../features/cycle/modules/cycle.module';

@Module({
    imports: [
        DatabaseModule,
        AuthModule,
        UsersModule,
        AdminModule,
        MarquesModule,
        TypeCyclesModule,
        CycleModule,
    ],
})
export class AppModule {}
