import {
    ConflictException,
    NotFoundException,
    Injectable,
    Inject,
} from '@nestjs/common';
import { TypeCycleResponseDto } from '../dto/output/type-cycle-response.dto';
import {
    TYPE_CYCLES_REPO,
    type ITypeCyclesRepository,
} from '../repositories/type-cycles.repository.interface';

@Injectable()
export class UpdateTypeCycleUseCase {
    constructor(
        @Inject(TYPE_CYCLES_REPO) private readonly repo: ITypeCyclesRepository,
    ) {}

    async execute(id: string, libelle: string): Promise<TypeCycleResponseDto> {
        const typeCycle = await this.repo.findById(id);
        if (!typeCycle) {
            throw new NotFoundException(
                `Type de cycle avec l'id ${id} introuvable`,
            );
        }

        const existing = await this.repo.findByLibelle(libelle);
        if (existing && existing.id !== id) {
            throw new ConflictException(
                `Le type de cycle "${libelle}" existe déjà`,
            );
        }

        return this.repo.update(id, libelle);
    }
}
