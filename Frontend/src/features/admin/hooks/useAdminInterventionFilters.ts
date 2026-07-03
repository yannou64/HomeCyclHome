import { useEffect, useState } from 'react';
import { adminZonesService } from '../services/adminZonesService';
import { adminUsersService } from '../services/adminUsersService';
import type { AdminUser } from '../types/admin.types';
import type { Zone } from '../types/zones.types';

// Données des filtres (zones + techniciens) pour l'écran des interventions admin
export function useAdminInterventionFilters() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [techniciens, setTechniciens] = useState<AdminUser[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        void (async () => {
            try {
                const data = await adminZonesService.getAll();
                setZones(data);
            } catch {
                setLoadError('Impossible de charger les zones.');
            }
        })();

        void (async () => {
            try {
                const result = await adminUsersService.getUsers({ role: 'technicien', limit: 100 });
                setTechniciens(result.data);
            } catch {
                setLoadError('Impossible de charger les techniciens.');
            }
        })();
    }, []);

    return { zones, techniciens, loadError };
}
