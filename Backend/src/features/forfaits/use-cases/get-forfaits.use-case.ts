import { ForfaitDto } from '../dto/forfait.dto';
import { IForfaitsRepository } from '../repositories/forfaits.repository.interface';

export class GetForfaitsUseCase {
    constructor(private readonly repo: IForfaitsRepository) {}

    async execute(): Promise<ForfaitDto[]> {
        return this.repo.findAll();
    }
}
