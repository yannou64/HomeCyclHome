import { NotFoundException } from '@nestjs/common';
import type { IAdressesRepository } from '../repositories/adresses.repository.interface';
import type { AdresseDto } from '../dto/output/adresse.dto';
import type { UpdateAdresseInput } from '../dto/input/adresse-input.dto';

export class UpdateAdresseUseCase {
    constructor(private readonly repo: IAdressesRepository) {}

    async execute(id: string, utilisateurId: string, data: UpdateAdresseInput): Promise<AdresseDto> {
        const liaison = await this.repo.findByIdAndUser(id, utilisateurId);
        if (!liaison) {
            throw new NotFoundException('Adresse introuvable.');
        }

        let result: AdresseDto | undefined;

        // Gestion du toggle adresse_principal (prioritaire — peut déclencher une transaction)
        if (data.adressePrincipal === true) {
            result = await this.repo.setPrincipal(id, utilisateurId);
        } else if (data.adressePrincipal === false) {
            result = await this.repo.unsetPrincipal(id);
        }

        // Mise à jour du titre_description si fourni
        if (data.titreDescription !== undefined) {
            result = await this.repo.updateMetadata(id, { titreDescription: data.titreDescription });
        }

        // result est toujours défini : au moins l'un des deux champs a été traité
        return result!;
    }
}
