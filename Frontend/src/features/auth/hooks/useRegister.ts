import { useState } from 'react';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { RegisterPayload } from '../types/auth.types';

const isDev = import.meta.env.DEV

export function useRegister() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    async function handleRegister(payload: RegisterPayload) {
        setIsLoading(true);
        setError(null);
        if(isDev) console.log("[useRegister] Tentative de s'enregistrer : ", payload)
        try {
            await authService.register(payload);
            setIsSuccess(true);
            if(isDev) console.log("[useRegister] Enregistrement réussi")
        } catch (e) {
            if (axios.isAxiosError(e) && e.response?.status === 409) {
                setError('Cet email est déjà utilisé.');
                console.warn("[useRegister] Tentative de s'enregistrer échoué car email déjà utilisé" )
            } else {
                console.error("[useRegister] Tentative de s'enregistrer échoué : ", e)
                setError('Une erreur est survenue. Réessaie.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return { handleRegister, isLoading, error, isSuccess };
}
