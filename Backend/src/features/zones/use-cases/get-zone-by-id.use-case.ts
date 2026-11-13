import { NotFoundException } from '@nestjs/common';
import { ZoneResponseDto } from '../dto/output/zone-response.dto';
import { IZonesRepository } from '../repositories/zones.repository.interface';

export class GetZoneByIdUseCase {
    constructor(private readonly repo: IZonesRepository) {}

    async execute(id: string): Promise<ZoneResponseDto> {
        const zone = await this.repo.findById(id);
        if (!zone) {
            throw new NotFoundException(`Zone avec l'id ${id} introuvable`);
        }
        return zone;
    }
}
