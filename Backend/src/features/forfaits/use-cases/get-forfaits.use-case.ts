import { ForfaitResponseDto } from '../dto/output/forfait-response.dto';
import { IForfaitsRepository } from '../repositories/forfaits.repository.interface';

export class GetForfaitsUseCase {
    constructor(private readonly repo: IForfaitsRepository) {}

    async execute(): Promise<ForfaitResponseDto[]> {
        return this.repo.findAll();
    }
}
