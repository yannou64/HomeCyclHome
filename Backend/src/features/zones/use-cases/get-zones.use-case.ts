import { ZoneDto } from '../dto/zone.dto';
import { IZonesRepository } from '../repositories/zones.repository.interface';

export class GetZonesUseCase {
    constructor(private readonly repo: IZonesRepository) {}

    async execute(): Promise<ZoneDto[]> {
        return this.repo.findAll();
    }
}