import { useCallback, useEffect, useState } from 'react';
import { adresseService } from '../services/adresseService';
import type { Adresse, CreateAdressePayload, UpdateAdressePayload } from '../types/adresse.types';

export function useAdresses() {
    const [adresses, setAdresses] = useState<Adresse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAdresses = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await adresseService.getAll();
            setAdresses(data);
        } catch {
            setError('Impossible de charger vos adresses.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchAdresses();
    }, [fetchAdresses]);

    const createAdresse = async (payload: CreateAdressePayload) => {
        await adresseService.create(payload);
        await fetchAdresses();
    };

    const updateAdresse = async (id: string, payload: UpdateAdressePayload) => {
        await adresseService.update(id, payload);
        await fetchAdresses();
    };

    const deleteAdresse = async (id: string) => {
        await adresseService.delete(id);
        await fetchAdresses();
    };

    return { adresses, isLoading, error, createAdresse, updateAdresse, deleteAdresse };
}
