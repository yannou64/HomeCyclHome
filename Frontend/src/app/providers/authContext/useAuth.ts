// useAuth.ts
// Point d'accès unique au AuthContext dans toute l'application.
// Plutôt que d'importer et d'utiliser useContext(AuthContext) dans chaque
// composant, on passe toujours par ce hook.
// Avantage : si l'implémentation change, on ne modifie que ce fichier.

import { useContext } from 'react';
import { AuthContext } from './auth.context';
import type { AuthContextType } from './types/auth.types';

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }

    return context;
}
