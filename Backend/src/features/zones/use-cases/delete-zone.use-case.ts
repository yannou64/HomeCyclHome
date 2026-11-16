import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import {
    ZONES_REPO,
    type IZonesRepository,
} from '../repositories/zones.repository.interface';

@Injectable()
export class DeleteZoneUseCase {
    constructor(@Inject(ZONES_REPO) private readonly repo: IZonesRepository) {}

    async execute(id: string): Promise<void> {
        const zone = await this.repo.findById(id);
        if (!zone) {
            throw new NotFoundException(`Zone avec l'id ${id} introuvable`);
        }
        await this.repo.delete(id);
    }
}
