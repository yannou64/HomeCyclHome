export class AdresseDto {
    id: string;              // PeutSeSituer.id — identifiant de la liaison
    adresseId: string;       // Adresse.id — identifiant de l'adresse physique
    numero: string | null;
    rue: string;
    codePostal: string;
    ville: string;
    pays: string;
    latitude: number;
    longitude: number;
    googlePlaceId: string;
    titreDescription: string | null;
    adressePrincipal: boolean;
    isValide: boolean;
    dateCreation: Date;
}
