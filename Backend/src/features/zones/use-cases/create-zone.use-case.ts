import { ConflictException } from '@nestjs/common';
import { ZoneDto } from '../dto/zone.dto';
import {
    CreateZoneData,
    IZonesRepository,
} from '../repositories/zones.repository.interface';

export class CreateZoneUseCase {
    constructor(private readonly repo: IZonesRepository) {}

    async execute(data: CreateZoneData): Promise<ZoneDto> {
        const exists = await this.repo.existsByNom(data.nomZone);
        if (exists) {
            throw new ConflictException(
                `Une zone avec le nom "${data.nomZone}" existe déjà`,
            );
        }
        return this.repo.create(data);
    }
}
