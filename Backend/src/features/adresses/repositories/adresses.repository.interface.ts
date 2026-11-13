import type { AdresseResponseDto } from '../dto/output/adresse-response.dto';
import type { CreateAdresseInput } from '../dto/input/create-adresse.dto';
import type { UpdateAdresseInput } from '../dto/input/update-adresse.dto';

export interface IAdressesRepository {
    // Retourne les liaisons actives (is_valide = true) de l'utilisateur
    findAllByUser(utilisateurId: string): Promise<AdresseResponseDto[]>;

    // Retourne une liaison active pour un utilisateur donné (ownership check)
    findByIdAndUser(
        id: string,
        utilisateurId: string,
    ): Promise<AdresseResponseDto | null>;

    // Cherche une adresse physique par google_place_id (déduplication à la création)
    findAdresseByGooglePlaceId(
        googlePlaceId: string,
    ): Promise<{ id: string } | null>;

    // Crée l'adresse physique si elle n'existe pas, puis crée la liaison PeutSeSituer
    create(
        utilisateurId: string,
        data: CreateAdresseInput,
    ): Promise<AdresseResponseDto>;

    // Modifie uniquement titre_description (adresse physique immuable)
    updateMetadata(
        id: string,
        data: Pick<UpdateAdresseInput, 'titreDescription'>,
    ): Promise<AdresseResponseDto>;

    // Transaction atomique : reset tous les adresse_principal de l'utilisateur, puis set celui-ci à true
    setPrincipal(
        id: string,
        utilisateurId: string,
    ): Promise<AdresseResponseDto>;

    // Passe adresse_principal à false sur cette liaison uniquement
    unsetPrincipal(id: string): Promise<AdresseResponseDto>;

    // Soft-delete : is_valide = false + date_invalidite = now()
    softDelete(id: string): Promise<void>;
}
