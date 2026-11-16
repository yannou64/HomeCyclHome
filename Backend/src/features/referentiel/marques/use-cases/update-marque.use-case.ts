import {
    ConflictException,
    NotFoundException,
    Injectable,
    Inject,
} from '@nestjs/common';
import { MarqueResponseDto } from '../dto/output/marque-response.dto';
import {
    MARQUES_REPO,
    type IMarquesRepository,
} from '../repositories/marques.repository.interface';

@Injectable()
export class UpdateMarqueUseCase {
    constructor(
        @Inject(MARQUES_REPO) private readonly repo: IMarquesRepository,
    ) {}

    async execute(id: string, libelle: string): Promise<MarqueResponseDto> {
        const marque = await this.repo.findById(id);
        if (!marque) {
            throw new NotFoundException(`Marque avec l'id ${id} introuvable`);
        }

        const existing = await this.repo.findByLibelle(libelle);
        if (existing && existing.id !== id) {
            throw new ConflictException(`La marque "${libelle}" existe déjà`);
        }

        return this.repo.update(id, libelle);
    }
}
