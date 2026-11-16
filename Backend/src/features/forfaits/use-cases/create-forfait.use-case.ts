import { ConflictException, Injectable, Inject } from '@nestjs/common';
import { ForfaitResponseDto } from '../dto/output/forfait-response.dto';
import {
    FORFAITS_REPO,
    type CreateForfaitData,
    type IForfaitsRepository,
} from '../repositories/forfaits.repository.interface';

@Injectable()
export class CreateForfaitUseCase {
    constructor(
        @Inject(FORFAITS_REPO) private readonly repo: IForfaitsRepository,
    ) {}

    async execute(data: CreateForfaitData): Promise<ForfaitResponseDto> {
        const existing = await this.repo.findByNom(data.nom);
        if (existing) {
            throw new ConflictException(
                `Un forfait avec le nom "${data.nom}" existe déjà`,
            );
        }
        return this.repo.create(data);
    }
}
