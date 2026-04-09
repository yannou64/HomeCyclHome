import { createContext } from 'react';
import type { AuthContextType } from './types/auth.types';

// Context séparé du composant Provider pour satisfaire react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
    undefined,
);
