import { Injectable, Inject } from '@nestjs/common';
import { ForfaitResponseDto } from '../dto/output/forfait-response.dto';
import {
    FORFAITS_REPO,
    type IForfaitsRepository,
} from '../repositories/forfaits.repository.interface';

@Injectable()
export class GetForfaitsUseCase {
    constructor(
        @Inject(FORFAITS_REPO) private readonly repo: IForfaitsRepository,
    ) {}

    async execute(): Promise<ForfaitResponseDto[]> {
        return this.repo.findAll();
    }
}
