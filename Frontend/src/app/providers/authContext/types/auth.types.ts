// auth.types.ts
// Représente uniquement ce qui concerne la session active.
// L'auth ne connaît pas l'entité User complète — elle sait juste
// qu'un utilisateur est connecté, son id (pour charger ses données ailleurs)
// et son rôle (pour adapter l'interface et protéger les routes).

// Les 3 rôles possibles dans l'application
export type Role = 'client' | 'technicien' | 'admin';

// La session active : le strict minimum pour gérer l'authentification
export type AuthSession = {
    userId: string; // permet de récupérer les données User si besoin
    role: Role; // permet d'adapter l'UI et de protéger les routes
};

// Ce que le AuthContext expose à toute l'application
export type AuthContextType = {
    session: AuthSession | null; // null = personne de connecté
    isAuthenticated: boolean; // raccourci : session !== null
    isLoading: boolean; // true pendant la lecture du localStorage
    login: (session: AuthSession) => void;
    logout: () => void;
};
