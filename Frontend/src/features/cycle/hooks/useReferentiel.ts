import { useEffect, useState } from 'react';
import { referentielService } from '../services/referentielService';
import type { Marque, TypeCycle } from '../types/cycle.types';

export function useReferentiel() {
    const [marques, setMarques] = useState<Marque[]>([]);
    const [typesCycles, setTypesCycles] = useState<TypeCycle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const [m, t] = await Promise.all([
                    referentielService.getMarques(),
                    referentielService.getTypesCycles(),
                ]);
                setMarques(m);
                setTypesCycles(t);
            } finally {
                setIsLoading(false);
            }
        }
        void fetch();
    }, []);

    return { marques, typesCycles, isLoading };
}
