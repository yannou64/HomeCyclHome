import {
    BadRequestException,
    NotFoundException,
    Injectable,
    Inject,
} from '@nestjs/common';
import {
    ADRESSES_REPO,
    type IAdressesRepository,
} from '../repositories/adresses.repository.interface';

@Injectable()
export class DeleteAdresseUseCase {
    constructor(
        @Inject(ADRESSES_REPO) private readonly repo: IAdressesRepository,
    ) {}

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
