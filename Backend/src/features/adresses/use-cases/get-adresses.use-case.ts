import { Injectable, Inject } from '@nestjs/common';
import {
    ADRESSES_REPO,
    type IAdressesRepository,
} from '../repositories/adresses.repository.interface';
import type { AdresseResponseDto } from '../dto/output/adresse-response.dto';

@Injectable()
export class GetAdressesUseCase {
    constructor(
        @Inject(ADRESSES_REPO) private readonly repo: IAdressesRepository,
    ) {}

    execute(utilisateurId: string): Promise<AdresseResponseDto[]> {
        return this.repo.findAllByUser(utilisateurId);
    }
}
