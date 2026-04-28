import { useCallback, useEffect, useState } from 'react';
import { cycleService } from '../services/cycleService';
import type { Cycle, CreateCyclePayload, UpdateCyclePayload } from '../types/cycle.types';

export function useCycles() {
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCycles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await cycleService.getAll();
            setCycles(data);
        } catch {
            setError('Impossible de charger vos cycles.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchCycles();
    }, [fetchCycles]);

    const createCycle = async (payload: CreateCyclePayload) => {
        await cycleService.create(payload);
        await fetchCycles();
    };

    const updateCycle = async (id: string, payload: UpdateCyclePayload) => {
        await cycleService.update(id, payload);
        await fetchCycles();
    };

    const deleteCycle = async (id: string) => {
        await cycleService.delete(id);
        await fetchCycles();
    };

    return { cycles, isLoading, error, createCycle, updateCycle, deleteCycle };
}
