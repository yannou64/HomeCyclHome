import { AffectationDto } from '../dto/affectation.dto';
import { IAffectationsRepository } from '../repositories/affectations.repository.interface';

export class GetAffectationsUseCase {
    constructor(private readonly repo: IAffectationsRepository) {}

    execute(): Promise<AffectationDto[]> {
        return this.repo.findAll();
    }
}
