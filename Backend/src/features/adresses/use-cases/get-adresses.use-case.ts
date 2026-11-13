import type { IAdressesRepository } from '../repositories/adresses.repository.interface';
import type { AdresseResponseDto } from '../dto/output/adresse-response.dto';

export class GetAdressesUseCase {
    constructor(private readonly repo: IAdressesRepository) {}

    execute(utilisateurId: string): Promise<AdresseResponseDto[]> {
        return this.repo.findAllByUser(utilisateurId);
    }
}
