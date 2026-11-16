import {
    ConflictException,
    NotFoundException,
    Injectable,
    Inject,
} from '@nestjs/common';
import { ZoneResponseDto } from '../dto/output/zone-response.dto';
import {
    ZONES_REPO,
    type IZonesRepository,
    type UpdateZoneData,
} from '../repositories/zones.repository.interface';

@Injectable()
export class UpdateZoneUseCase {
    constructor(@Inject(ZONES_REPO) private readonly repo: IZonesRepository) {}

    async execute(id: string, data: UpdateZoneData): Promise<ZoneResponseDto> {
        const zone = await this.repo.findById(id);
        if (!zone) {
            throw new NotFoundException(`Zone avec l'id ${id} introuvable`);
        }

        if (data.nomZone) {
            // excludeId = id courant → ne se détecte pas soi-même comme conflit
            const exists = await this.repo.existsByNom(data.nomZone, id);
            if (exists) {
                throw new ConflictException(
                    `Une zone avec le nom "${data.nomZone}" existe déjà`,
                );
            }
        }

        return this.repo.update(id, data);
    }
}
