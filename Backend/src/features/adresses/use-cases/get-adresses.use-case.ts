import type { IAdressesRepository } from '../repositories/adresses.repository.interface';
import type { AdresseDto } from '../dto/output/adresse.dto';

export class GetAdressesUseCase {
    constructor(private readonly repo: IAdressesRepository) {}

    execute(utilisateurId: string): Promise<AdresseDto[]> {
        return this.repo.findAllByUser(utilisateurId);
    }
}
