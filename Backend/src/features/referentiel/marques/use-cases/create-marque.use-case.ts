import { ConflictException, Injectable, Inject } from '@nestjs/common';
import { MarqueResponseDto } from '../dto/output/marque-response.dto';
import {
    MARQUES_REPO,
    type IMarquesRepository,
} from '../repositories/marques.repository.interface';

@Injectable()
export class CreateMarqueUseCase {
    constructor(
        @Inject(MARQUES_REPO) private readonly repo: IMarquesRepository,
    ) {}

    async execute(libelle: string): Promise<MarqueResponseDto> {
        const existing = await this.repo.findByLibelle(libelle);
        if (existing) {
            throw new ConflictException(`La marque "${libelle}" existe déjà`);
        }
        return this.repo.create(libelle);
    }
}
