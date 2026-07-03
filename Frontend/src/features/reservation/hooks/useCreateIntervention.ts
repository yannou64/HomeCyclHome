import { useState } from 'react';
import { interventionService } from '../services/interventionService';
import type {
    CreateInterventionRequest,
    InterventionCreatedDto,
} from '../types/intervention.types';

export function useCreateIntervention() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createIntervention = async (
        request: CreateInterventionRequest,
        photos?: File[],
    ): Promise<{ intervention: InterventionCreatedDto; photoUrls: string[] }> => {
        setIsLoading(true);
        setError(null);
        try {
            const intervention = await interventionService.create(request);

            // Upload best-effort : un échec S3 ne doit pas annuler la réservation
            let photoUrls: string[] = [];
            if (photos && photos.length > 0) {
                try {
                    const uploaded = await interventionService.uploadPhotos(
                        intervention.id,
                        photos,
                    );
                    photoUrls = uploaded.urls;
                } catch {
                    // silencieux — l'intervention est créée, les photos sont perdues
                }
            }

            return { intervention, photoUrls };
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Une erreur est survenue.';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { createIntervention, isLoading, error };
}
