import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';

@Module({
    providers: [StorageService],
    exports: [StorageService], // injectable dans les autres modules
})
export class StorageModule {}
