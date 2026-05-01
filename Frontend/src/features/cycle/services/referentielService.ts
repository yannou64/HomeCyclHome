import { apiClient } from '../../../shared/services/apiClient';
import type { Marque, TypeCycle } from '../types/cycle.types';

export const referentielService = {
    getMarques(): Promise<Marque[]> {
        return apiClient.get<Marque[]>('/referentiel/marques').then((r) => r.data);
    },

    getTypesCycles(): Promise<TypeCycle[]> {
        return apiClient.get<TypeCycle[]>('/referentiel/type-cycles').then((r) => r.data);
    },
};
