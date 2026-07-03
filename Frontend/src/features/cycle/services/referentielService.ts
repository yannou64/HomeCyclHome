import { apiClient } from '../../../shared/services/apiClient';
import type { Marque, TypeCycle } from '../types/cycle.types';

export const referentielService = {
    async getMarques(): Promise<Marque[]> {
        const r = await apiClient.get<Marque[]>('/referentiel/marques');
        return r.data;
    },

    async getTypesCycles(): Promise<TypeCycle[]> {
        const r = await apiClient.get<TypeCycle[]>('/referentiel/type-cycles');
        return r.data;
    },
};
