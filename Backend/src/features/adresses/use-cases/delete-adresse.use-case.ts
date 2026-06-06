import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { IAdressesRepository } from '../repositories/adresses.repository.interface';

export class DeleteAdresseUseCase {
    constructor(private readonly repo: IAdressesRepository) {}

    async execute(id: string, utilisateurId: string): Promise<void> {
        const liaison = await this.repo.findByIdAndUser(id, utilisateurId);
        if (!liaison) {
            throw new NotFoundException('Adresse introuvable.');
        }

        const adressesActives = await this.repo.findAllByUser(utilisateurId);
        if (adressesActives.length <= 1) {
            throw new BadRequestException(
                'Vous devez conserver au moins une adresse.',
            );
        }

        await this.repo.softDelete(id);
    }
}
