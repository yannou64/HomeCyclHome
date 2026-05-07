import { ConflictException, NotFoundException } from '@nestjs/common';
import { ZoneDto } from '../dto/zone.dto';
import {
    IZonesRepository,
    UpdateZoneData,
} from '../repositories/zones.repository.interface';

export class UpdateZoneUseCase {
    constructor(private readonly repo: IZonesRepository) {}

    async execute(id: string, data: UpdateZoneData): Promise<ZoneDto> {
        const zone = await this.repo.findById(id);
        if (!zone) {
            throw new NotFoundException(`Zone avec l'id ${id} introuvable`);
        }

        if (data.nom_zone) {
            // excludeId = id courant → ne se détecte pas soi-même comme conflit
            const exists = await this.repo.existsByNom(data.nom_zone, id);
            if (exists) {
                throw new ConflictException(
                    `Une zone avec le nom "${data.nom_zone}" existe déjà`,
                );
            }
        }

        return this.repo.update(id, data);
    }
}
