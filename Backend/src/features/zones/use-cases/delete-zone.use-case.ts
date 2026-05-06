import { NotFoundException } from '@nestjs/common';
import { IZonesRepository } from '../repositories/zones.repository.interface';

export class DeleteZoneUseCase {
    constructor(private readonly repo: IZonesRepository) {}

    async execute(id: string): Promise<void> {
        const zone = await this.repo.findById(id);
        if (!zone) {
            throw new NotFoundException(`Zone avec l'id ${id} introuvable`);
        }
        await this.repo.delete(id);
    }
}