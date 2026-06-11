import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/authContext/useAuth';
import { authService } from '../services/authService';
import { PENDING_RESERVATION_KEY } from '../../../app/providers/reservationContext/types/reservation.types';

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
            localStorage.removeItem(PENDING_RESERVATION_KEY); // réservation en attente obsolète
            logout();                // efface session + localStorage
            navigate('/login');
        }
    }

    return { handleLogout };
}