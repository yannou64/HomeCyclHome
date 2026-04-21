// AuthContext.tsx
// Responsabilité unique : gérer la SESSION active.
// Ce composant ne sait pas qui est l'utilisateur (nom, prénom...),
// il sait juste qu'une session existe, avec quel rôle.
// Si un composant a besoin des données complètes de l'utilisateur,
// il utilisera le userId de la session pour faire un appel API séparé.

import { useState, type ReactNode } from 'react';
import { AuthContext } from './auth.context';
import type { AuthSession, AuthContextType } from './types/auth.types';

type AuthProviderProps = {
    children: ReactNode;
};

function readInitialSession(): AuthSession | null {
    const stored = localStorage.getItem('session');
    if (!stored) return null;

    try {
        return JSON.parse(stored) as AuthSession;
    } catch {
        localStorage.removeItem('session');
        return null;
    }
}

export function AuthProvider({ children }: AuthProviderProps) {
    // Lecture 1 seule fois au montage, sans setState dans useEffect
    const [session, setSession] = useState<AuthSession | null>(
        readInitialSession,
    );
    const [isLoading] = useState(false);

    const login = (newSession: AuthSession) => {
        setSession(newSession);
        localStorage.setItem('session', JSON.stringify(newSession));
    };

    const logout = () => {
        setSession(null);
        localStorage.removeItem('session');
    };

    const value: AuthContextType = {
        session,
        isAuthenticated: session !== null,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
