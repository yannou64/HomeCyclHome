import { ConflictException } from '@nestjs/common';
import { ForfaitResponseDto } from '../dto/output/forfait-response.dto';
import {
    CreateForfaitData,
    IForfaitsRepository,
} from '../repositories/forfaits.repository.interface';

export class CreateForfaitUseCase {
    constructor(private readonly repo: IForfaitsRepository) {}

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
