import { ConflictException } from '@nestjs/common';
import type { IAdressesRepository } from '../repositories/adresses.repository.interface';
import type { AdresseDto } from '../dto/output/adresse.dto';
import type { CreateAdresseInput } from '../dto/input/adresse-input.dto';

export class CreateAdresseUseCase {
    constructor(private readonly repo: IAdressesRepository) {}

    async execute(utilisateurId: string, data: CreateAdresseInput): Promise<AdresseDto> {
        // Vérifier si cette adresse physique est déjà liée et active pour cet utilisateur
        const existingAdresse = await this.repo.findAdresseByGooglePlaceId(data.googlePlaceId);
        if (existingAdresse) {
            const liaisonsActives = await this.repo.findAllByUser(utilisateurId);
            const dejaLiee = liaisonsActives.some((a) => a.adresseId === existingAdresse.id);
            if (dejaLiee) {
                throw new ConflictException('Cette adresse est déjà enregistrée dans votre profil.');
            }
        }

        const newAdresse = await this.repo.create(utilisateurId, data);

        if (data.adressePrincipal) {
            return this.repo.setPrincipal(newAdresse.id, utilisateurId);
        }

        return newAdresse;
    }
}
