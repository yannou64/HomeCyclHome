// Données retournées par le repository — inclut les champs sensibles nécessaires aux use cases
export type AuthUserData = {
    id: string;
    email: string;
    prenom: string;
    role: string;
    password_hash: string;
    is_actif: boolean;
    email_confirmation_token: string | null;
    token_expires_at: Date | null;
};

// Données nécessaires à la création d'un compte
export type CreateUserData = {
    nom: string;
    prenom: string;
    email: string;
    password_hash: string;
    telephone: string;
    email_confirmation_token: string;
    token_expires_at: Date;
};

// Le contrat : les use cases dépendent de cette interface, jamais de Prisma directement
export interface IAuthRepository {
    existsByEmail(email: string): Promise<boolean>;
    findByEmail(email: string): Promise<AuthUserData | null>;
    findByConfirmationToken(token: string): Promise<AuthUserData | null>;
    create(data: CreateUserData): Promise<AuthUserData>;
    activate(userId: string): Promise<void>;
    saveRefreshTokenHash(userId: string, hash: string): Promise<void>;
    clearRefreshTokenHash(userId: string): Promise<void>;
}
