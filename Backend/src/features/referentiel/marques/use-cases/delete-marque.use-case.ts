import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import {
    MARQUES_REPO,
    type IMarquesRepository,
} from '../repositories/marques.repository.interface';

@Injectable()
export class DeleteMarqueUseCase {
    constructor(
        @Inject(MARQUES_REPO) private readonly repo: IMarquesRepository,
    ) {}

    async execute(id: string): Promise<void> {
        const marque = await this.repo.findById(id);
        if (!marque) {
            throw new NotFoundException(`Marque avec l'id ${id} introuvable`);
        }
        await this.repo.delete(id);
    }
}
