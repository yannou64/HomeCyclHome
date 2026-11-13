import { AffectationResponseDto } from '../dto/output/affectation-response.dto';
import { IAffectationsRepository } from '../repositories/affectations.repository.interface';

export class GetAffectationsUseCase {
    constructor(private readonly repo: IAffectationsRepository) {}

    execute(): Promise<AffectationResponseDto[]> {
        return this.repo.findAll();
    }
}
