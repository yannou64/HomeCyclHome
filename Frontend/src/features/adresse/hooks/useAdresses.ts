import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { adresseService } from '../services/adresseService';
import type {
    Adresse,
    CreateAdressePayload,
    UpdateAdressePayload,
} from '../types/adresse.types';

// Loader défini hors du composant : référence stable, la liste n'est
// chargée qu'au montage puis à chaque reload().
const loadAdresses = () => adresseService.getAll();

export function useAdresses() {
    const {
        data: adresses,
        isLoading,
        error,
        reload,
    } = useAsyncData<Adresse[]>(
        loadAdresses,
        [],
        'Impossible de charger vos adresses.',
    );

    const createAdresse = async (payload: CreateAdressePayload) => {
        await adresseService.create(payload);
        reload();
    };

    const updateAdresse = async (id: string, payload: UpdateAdressePayload) => {
        await adresseService.update(id, payload);
        reload();
    };

    const deleteAdresse = async (id: string) => {
        await adresseService.delete(id);
        reload();
    };

    return {
        adresses,
        isLoading,
        error,
        createAdresse,
        updateAdresse,
        deleteAdresse,
    };
}
