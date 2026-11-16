import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adminZonesService } from '../services/adminZonesService';
import type {
    Zone,
    CreateZonePayload,
    UpdateZonePayload,
} from '../types/zones.types';

// Loader défini hors du composant : référence stable, la liste n'est
// chargée qu'au montage puis à chaque reload().
const loadZones = () => adminZonesService.getAll();

export function useAdminZones() {
    const {
        data: items,
        isLoading,
        error,
        reload,
    } = useAsyncData<Zone[]>(loadZones, [], 'Impossible de charger les zones.');

    const createZone = async (payload: CreateZonePayload) => {
        await adminZonesService.create(payload);
        reload();
    };

    const updateZone = async (id: string, payload: UpdateZonePayload) => {
        await adminZonesService.update(id, payload);
        reload();
    };

    const deleteZone = async (id: string) => {
        await adminZonesService.delete(id);
        reload();
    };

    return { items, isLoading, error, createZone, updateZone, deleteZone };
}
