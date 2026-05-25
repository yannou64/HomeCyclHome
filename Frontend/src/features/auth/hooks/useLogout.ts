import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/authContext/useAuth';
import { authService } from '../services/authService';

const isDev = import.meta.env.DEV

export function useLogout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    async function handleLogout() {
        if(isDev) console.log("[useLogout] Tentative de logout")
        try {
            await authService.logout();   // POST /auth/logout → efface cookies + refresh token en base
            if(isDev) console.log("[useLogout] Logout réussi")
        } catch {
            console.error("[useLogout] Erreur backend pendant le logout")
            // même en cas d'erreur réseau, on déconnecte localement
        } finally {
            logout();                // efface session + localStorage
            navigate('/login');
        }
    }

    return { handleLogout };
}