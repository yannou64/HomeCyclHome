import { ForfaitResponseDto } from '../dto/output/forfait-response.dto';
import { IForfaitsRepository } from '../repositories/forfaits.repository.interface';

export class GetForfaitsActifsUseCase {
    constructor(private readonly repo: IForfaitsRepository) {}

    async execute(): Promise<ForfaitResponseDto[]> {
        return this.repo.findAllActifs();
    }
}
