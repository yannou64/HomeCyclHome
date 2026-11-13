import { ZoneResponseDto } from '../dto/output/zone-response.dto';
import { IZonesRepository } from '../repositories/zones.repository.interface';

export class GetZonesUseCase {
    constructor(private readonly repo: IZonesRepository) {}

    async execute(): Promise<ZoneResponseDto[]> {
        return this.repo.findAll();
    }
}
