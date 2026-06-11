import { useState } from 'react';
import { interventionService } from '../services/interventionService';
import type { CreateInterventionRequest, InterventionCreatedDto } from '../types/intervention.types';

export function useCreateIntervention() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createIntervention = async (
        request: CreateInterventionRequest,
    ): Promise<InterventionCreatedDto> => {
        setIsLoading(true);
        setError(null);
        try {
            return await interventionService.create(request);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Une erreur est survenue.';
            setError(message);
            throw err; // on re-throw pour que RecapitulatifStep puisse réagir
        } finally {
            setIsLoading(false);
        }
    };

    return { createIntervention, isLoading, error };
}
