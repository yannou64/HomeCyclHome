import { ConflictException, Injectable, Inject } from '@nestjs/common';
import { ZoneResponseDto } from '../dto/output/zone-response.dto';
import {
    ZONES_REPO,
    type CreateZoneData,
    type IZonesRepository,
} from '../repositories/zones.repository.interface';

@Injectable()
export class CreateZoneUseCase {
    constructor(@Inject(ZONES_REPO) private readonly repo: IZonesRepository) {}

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
