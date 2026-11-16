import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { referentielService } from '../services/referentielService';
import type { Marque, TypeCycle } from '../types/cycle.types';

interface Referentiel {
    marques: Marque[];
    typesCycles: TypeCycle[];
}

const REFERENTIEL_VIDE: Referentiel = { marques: [], typesCycles: [] };

// Loader défini hors du composant : référence stable, chargé une fois au montage.
async function loadReferentiel(): Promise<Referentiel> {
    const [marques, typesCycles] = await Promise.all([
        referentielService.getMarques(),
        referentielService.getTypesCycles(),
    ]);
    return { marques, typesCycles };
}

export function useReferentiel() {
    const {
        data: { marques, typesCycles },
        isLoading,
    } = useAsyncData(
        loadReferentiel,
        REFERENTIEL_VIDE,
        'Impossible de charger les marques et types de cycles.',
    );

    return { marques, typesCycles, isLoading };
}
