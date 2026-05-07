import { Inject } from '@nestjs/common';
import { AffectationDto } from '../dto/affectation.dto';
import {
    AFFECTATIONS_REPO,
    IAffectationsRepository,
} from '../repositories/affectations.repository.interface';

export class GetAffectationsUseCase {
    constructor(
        @Inject(AFFECTATIONS_REPO)
        private readonly repo: IAffectationsRepository,
    ) {}

    execute(): Promise<AffectationDto[]> {
        return this.repo.findAll();
    }
}