export type Adresse = {
    id: string;               // PeutSeSituer.id — identifiant de la liaison
    adresseId: string;        // Adresse.id — identifiant de l'adresse physique
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
    dateCreation: string;
};

// Données issues de la décomposition Google Maps Autocomplete
export type DecomposedAddress = {
    numero?: string;
    rue: string;
    codePostal: string;
    ville: string;
    pays: string;
    latitude: number;
    longitude: number;
    googlePlaceId: string;
};

export type CreateAdressePayload = DecomposedAddress & {
    titreDescription?: string;
    adressePrincipal?: boolean;
};

export type UpdateAdressePayload = {
    titreDescription?: string;
    adressePrincipal?: boolean;
};
