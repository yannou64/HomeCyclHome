import { Module } from '@nestjs/common';
import { DatabaseModule } from '../shared/database/database.module';
import { AuthModule } from '../features/auth/modules/auth.module';

@Module({
    imports: [DatabaseModule, AuthModule],
})
export class AppModule {}
