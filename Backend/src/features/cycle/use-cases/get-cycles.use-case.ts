import { Injectable, Inject } from '@nestjs/common';
import { CycleResponseDto } from '../dto/output/cycle-response.dto';
import {
    CYCLES_REPO,
    type ICyclesRepository,
} from '../repositories/cycles.repository.interface';

@Injectable()
export class GetCyclesUseCase {
    constructor(
        @Inject(CYCLES_REPO) private readonly repo: ICyclesRepository,
    ) {}

    execute(utilisateurId: string): Promise<CycleResponseDto[]> {
        return this.repo.findAllByUser(utilisateurId);
    }
}
