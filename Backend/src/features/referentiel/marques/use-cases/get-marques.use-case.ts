import { MarqueResponseDto } from '../dto/output/marque-response.dto';
import { IMarquesRepository } from '../repositories/marques.repository.interface';

export class GetMarquesUseCase {
    constructor(private readonly repo: IMarquesRepository) {}

    execute(): Promise<MarqueResponseDto[]> {
        return this.repo.findAll();
    }
}
