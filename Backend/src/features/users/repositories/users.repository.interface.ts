import { UserProfileResponseDto } from '../dto/output/user-profile-response.dto';

// Jeton d'injection : l'interface disparaît à la compilation, Nest
// retrouve l'implémentation par ce nom (voir le module).
export const USERS_REPO = 'USERS_REPO';

// Données acceptées pour la mise à jour — tous les champs sont optionnels (PATCH)
export type UpdateUserData = {
    nom?: string;
    prenom?: string;
    telephone?: string;
};

// Résultat d'une suppression : `supprime: false` quand la base l'a refusée parce
// que le compte est encore référencé (violation de clé étrangère, RESTRICT).
export type ResultatSuppression = { supprime: boolean };

// Le contrat : les use cases dépendent de cette interface, jamais de Prisma directement
export interface IUsersRepository {
    findById(id: string): Promise<UserProfileResponseDto | null>;
    update(id: string, data: UpdateUserData): Promise<UserProfileResponseDto>;
    // Nombre d'interventions où l'utilisateur est client OU technicien, tous statuts
    compterInterventions(id: string): Promise<number>;
    deleteById(id: string): Promise<ResultatSuppression>;
}
