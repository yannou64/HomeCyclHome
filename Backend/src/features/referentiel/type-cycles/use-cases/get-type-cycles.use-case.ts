import { Injectable, Inject } from '@nestjs/common';
import { TypeCycleResponseDto } from '../dto/output/type-cycle-response.dto';
import {
    TYPE_CYCLES_REPO,
    type ITypeCyclesRepository,
} from '../repositories/type-cycles.repository.interface';

@Injectable()
export class GetTypeCyclesUseCase {
    constructor(
        @Inject(TYPE_CYCLES_REPO) private readonly repo: ITypeCyclesRepository,
    ) {}

    execute(): Promise<TypeCycleResponseDto[]> {
        return this.repo.findAll();
    }
}
