import { ConflictException } from '@nestjs/common';
import { ZoneResponseDto } from '../dto/output/zone-response.dto';
import {
    CreateZoneData,
    IZonesRepository,
} from '../repositories/zones.repository.interface';

export class CreateZoneUseCase {
    constructor(private readonly repo: IZonesRepository) {}

    async execute(data: CreateZoneData): Promise<ZoneResponseDto> {
        const exists = await this.repo.existsByNom(data.nomZone);
        if (exists) {
            throw new ConflictException(
                `Une zone avec le nom "${data.nomZone}" existe déjà`,
            );
        }
        return this.repo.create(data);
    }
}
