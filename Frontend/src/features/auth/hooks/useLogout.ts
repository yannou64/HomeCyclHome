import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/authContext/useAuth';
import { authService } from '../services/authService';
import { PENDING_RESERVATION_KEY } from '../../../app/providers/reservationContext/types/reservation.types';

export function useLogout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    async function handleLogout() {
        try {
            await authService.logout(); // POST /auth/logout → efface cookies + refresh token en base
        } catch {
            // même en cas d'erreur réseau, on déconnecte localement
        } finally {
            localStorage.removeItem(PENDING_RESERVATION_KEY); // réservation en attente obsolète
            logout(); // efface session + localStorage
            navigate('/login');
        }
    }

    return { handleLogout };
}
