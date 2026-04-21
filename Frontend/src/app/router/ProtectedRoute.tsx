import { Navigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/authContext/useAuth';
import type { Role } from '../../app/providers/authContext/types/auth.types';
import type { ReactNode } from 'react';

type ProtectedRouteProps = {
    children: ReactNode;
    roles?: Role[]; // si absent → toute session valide suffit
};

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
    const { session, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles && session && !roles.includes(session.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
}
