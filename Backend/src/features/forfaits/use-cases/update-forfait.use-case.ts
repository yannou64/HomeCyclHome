import {
    ConflictException,
    NotFoundException,
    Injectable,
    Inject,
} from '@nestjs/common';
import { ForfaitResponseDto } from '../dto/output/forfait-response.dto';
import {
    FORFAITS_REPO,
    type IForfaitsRepository,
    type UpdateForfaitData,
} from '../repositories/forfaits.repository.interface';

@Injectable()
export class UpdateForfaitUseCase {
    constructor(
        @Inject(FORFAITS_REPO) private readonly repo: IForfaitsRepository,
    ) {}

    async execute(
        id: string,
        data: UpdateForfaitData,
    ): Promise<ForfaitResponseDto> {
        const forfait = await this.repo.findById(id);
        if (!forfait) {
            throw new NotFoundException(`Forfait avec l'id ${id} introuvable`);
        }

        if (data.nom) {
            const nomOwner = await this.repo.findByNom(data.nom);
            // Conflit uniquement si le nom appartient à un AUTRE forfait
            if (nomOwner && nomOwner.id !== id) {
                throw new ConflictException(
                    `Un forfait avec le nom "${data.nom}" existe déjà`,
                );
            }
        }

        return this.repo.update(id, data);
    }
}
