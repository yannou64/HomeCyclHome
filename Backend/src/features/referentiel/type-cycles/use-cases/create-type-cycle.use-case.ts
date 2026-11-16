import { ConflictException, Injectable, Inject } from '@nestjs/common';
import { TypeCycleResponseDto } from '../dto/output/type-cycle-response.dto';
import {
    TYPE_CYCLES_REPO,
    type ITypeCyclesRepository,
} from '../repositories/type-cycles.repository.interface';

@Injectable()
export class CreateTypeCycleUseCase {
    constructor(
        @Inject(TYPE_CYCLES_REPO) private readonly repo: ITypeCyclesRepository,
    ) {}

    async execute(libelle: string): Promise<TypeCycleResponseDto> {
        const existing = await this.repo.findByLibelle(libelle);
        if (existing) {
            throw new ConflictException(
                `Le type de cycle "${libelle}" existe déjà`,
            );
        }
        return this.repo.create(libelle);
    }
}
