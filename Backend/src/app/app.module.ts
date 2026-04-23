import { Module } from '@nestjs/common';
import { DatabaseModule } from '../shared/database/database.module';
import { AuthModule } from '../features/auth/modules/auth.module';
import { UsersModule } from '../features/users/modules/users.module';

@Module({
    imports: [DatabaseModule, AuthModule, UsersModule],
})
export class AppModule {}
