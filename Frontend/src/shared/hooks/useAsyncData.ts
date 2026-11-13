import { useCallback, useEffect, useState } from 'react';

// Résultat du dernier chargement terminé, mémorisé avec la « demande » qui l'a
// produit (le loader et la valeur du compteur de rechargement à ce moment-là).
interface LoadedState<T> {
    loader: (() => Promise<T>) | null; // null : aucun chargement terminé
    reloadKey: number;
    data: T;
    error: string | null;
}

export interface AsyncData<T> {
    data: T;
    isLoading: boolean;
    error: string | null;
    // À appeler après une modification (création, suppression…) pour recharger.
    reload: () => void;
}

/**
 * Charge une donnée depuis l'API et expose son état (data, isLoading, error).
 *
 * ⚠️ `loader` doit être STABLE d'un rendu à l'autre : une fonction définie hors
 * du composant, ou enveloppée dans `useCallback` avec ses dépendances (filtres,
 * page…). Quand ces dépendances changent, le loader change et la donnée est
 * rechargée. Une fonction recréée à chaque rendu relancerait le chargement
 * en boucle.
 *
 * Pourquoi ce hook : il ne fait aucun setState synchrone dans un effet (règle
 * react-hooks/set-state-in-effect). Tous les setState ont lieu après l'await,
 * et `isLoading` est calculé pendant le rendu au lieu d'être stocké.
 */
export function useAsyncData<T>(
    loader: () => Promise<T>,
    initialData: T,
    errorMessage: string,
): AsyncData<T> {
    // Incrémenté par reload() : relance l'effet sans changer de loader.
    const [reloadKey, setReloadKey] = useState(0);
    const [loaded, setLoaded] = useState<LoadedState<T>>({
        loader: null,
        reloadKey: -1,
        data: initialData,
        error: null,
    });

    useEffect(() => {
        // Passe à true si l'effet est relancé (nouveau filtre, nouvelle page) ou
        // le composant démonté avant la réponse : une réponse arrivée trop tard
        // ne doit pas écraser la plus récente.
        let ignore = false;
        void (async () => {
            try {
                const data = await loader();
                if (!ignore)
                    setLoaded({ loader, reloadKey, data, error: null });
            } catch {
                // On garde les données précédentes, on signale seulement l'erreur.
                if (!ignore) {
                    setLoaded((prev) => ({
                        ...prev,
                        loader,
                        reloadKey,
                        error: errorMessage,
                    }));
                }
            }
        })();
        return () => {
            ignore = true;
        };
    }, [loader, reloadKey, errorMessage]);

    const reload = useCallback(() => setReloadKey((k) => k + 1), []);

    // État dérivé, calculé à chaque rendu (aucun setState) : on charge tant que
    // le dernier résultat reçu ne correspond pas à la demande en cours.
    const isLoading =
        loaded.loader !== loader || loaded.reloadKey !== reloadKey;

    return {
        data: loaded.data,
        isLoading,
        // Pendant un rechargement, on masque l'erreur précédente.
        error: isLoading ? null : loaded.error,
        reload,
    };
}
