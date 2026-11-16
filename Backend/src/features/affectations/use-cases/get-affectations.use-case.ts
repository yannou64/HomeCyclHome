import { Injectable, Inject } from '@nestjs/common';
import { AffectationResponseDto } from '../dto/output/affectation-response.dto';
import {
    AFFECTATIONS_REPO,
    type IAffectationsRepository,
} from '../repositories/affectations.repository.interface';

@Injectable()
export class GetAffectationsUseCase {
    constructor(
        @Inject(AFFECTATIONS_REPO)
        private readonly repo: IAffectationsRepository,
    ) {}

    execute(): Promise<AffectationResponseDto[]> {
        return this.repo.findAll();
    }
}
