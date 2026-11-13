import { useAsyncData } from '../../../shared/hooks/useAsyncData';
import { cycleService } from '../services/cycleService';
import type { Cycle, CreateCyclePayload, UpdateCyclePayload } from '../types/cycle.types';

// Loader défini hors du composant : référence stable, la liste n'est
// chargée qu'au montage puis à chaque reload().
const loadCycles = () => cycleService.getAll();

export function useCycles() {
    const {
        data: cycles,
        isLoading,
        error,
        reload,
    } = useAsyncData<Cycle[]>(loadCycles, [], 'Impossible de charger vos cycles.');

    const createCycle = async (payload: CreateCyclePayload) => {
        await cycleService.create(payload);
        reload();
    };

    const updateCycle = async (id: string, payload: UpdateCyclePayload) => {
        await cycleService.update(id, payload);
        reload();
    };

    const deleteCycle = async (id: string) => {
        await cycleService.delete(id);
        reload();
    };

    return { cycles, isLoading, error, createCycle, updateCycle, deleteCycle };
}
