import { Injectable, Inject } from '@nestjs/common';
import { CreateCycleInput } from '../dto/input/create-cycle.dto';
import { CycleResponseDto } from '../dto/output/cycle-response.dto';
import {
    CYCLES_REPO,
    type ICyclesRepository,
} from '../repositories/cycles.repository.interface';

@Injectable()
export class CreateCycleUseCase {
    constructor(
        @Inject(CYCLES_REPO) private readonly repo: ICyclesRepository,
    ) {}

    execute(
        utilisateurId: string,
        data: CreateCycleInput,
    ): Promise<CycleResponseDto> {
        return this.repo.create(utilisateurId, data);
    }
}
