import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import { ZoneResponseDto } from '../dto/output/zone-response.dto';
import {
    ZONES_REPO,
    type IZonesRepository,
} from '../repositories/zones.repository.interface';

@Injectable()
export class GetZoneByIdUseCase {
    constructor(@Inject(ZONES_REPO) private readonly repo: IZonesRepository) {}

    async execute(id: string): Promise<ZoneResponseDto> {
        const zone = await this.repo.findById(id);
        if (!zone) {
            throw new NotFoundException(`Zone avec l'id ${id} introuvable`);
        }
        return zone;
    }
}
