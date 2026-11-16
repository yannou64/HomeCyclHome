import { Injectable, Inject } from '@nestjs/common';
import { ZoneResponseDto } from '../dto/output/zone-response.dto';
import {
    ZONES_REPO,
    type IZonesRepository,
} from '../repositories/zones.repository.interface';

@Injectable()
export class GetZonesUseCase {
    constructor(@Inject(ZONES_REPO) private readonly repo: IZonesRepository) {}

    async execute(): Promise<ZoneResponseDto[]> {
        return this.repo.findAll();
    }
}
