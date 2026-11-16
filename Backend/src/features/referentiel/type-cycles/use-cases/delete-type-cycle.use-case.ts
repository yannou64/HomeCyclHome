import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import {
    TYPE_CYCLES_REPO,
    type ITypeCyclesRepository,
} from '../repositories/type-cycles.repository.interface';

@Injectable()
export class DeleteTypeCycleUseCase {
    constructor(
        @Inject(TYPE_CYCLES_REPO) private readonly repo: ITypeCyclesRepository,
    ) {}

    async execute(id: string): Promise<void> {
        const typeCycle = await this.repo.findById(id);
        if (!typeCycle) {
            throw new NotFoundException(
                `Type de cycle avec l'id ${id} introuvable`,
            );
        }
        await this.repo.delete(id);
    }
}
