import { useCallback, useEffect, useRef, useState } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import type { DecomposedAddress } from '../types/adresse.types';

setOptions({
    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    v: 'weekly',
});

function extractComponent(
    components: google.maps.GeocoderAddressComponent[],
    type: string,
): string {
    const found = components.find((c) => c.types.includes(type));
    return found ? found.long_name : '';
}

export function useAddressAutocomplete() {
    // useState déclenche un re-render quand l'input monte/démonte → useEffect se relance
    const [inputEl, setInputEl] = useState<HTMLInputElement | null>(null);
    // useRef donne un accès impératif mutable à l'élément (écriture de .value)
    const inputElRef = useRef<HTMLInputElement | null>(null);
    const [decomposedAddress, setDecomposedAddress] = useState<DecomposedAddress | null>(null);

    // Callback ref : React appelle cette fonction avec l'élément réel
    // quand l'input est monté, et avec null quand il est démonté.
    const inputRef = useCallback((node: HTMLInputElement | null) => {
        inputElRef.current = node;
        setInputEl(node);
    }, []);

    useEffect(() => {
        // On n'attache l'Autocomplete que quand l'input est présent dans le DOM
        if (!inputEl) return;

        let listenerHandle: google.maps.MapsEventListener | null = null;

        const run = async () => {
            const { Autocomplete } = await importLibrary('places');

            const autocomplete = new Autocomplete(inputEl, {
                componentRestrictions: { country: 'fr' },
                fields: ['address_components', 'geometry', 'place_id'],
                types: ['address'],
            });

            listenerHandle = autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();

                if (!place.address_components || !place.geometry?.location) {
                    setDecomposedAddress(null);
                    return;
                }

                const components = place.address_components;

                setDecomposedAddress({
                    numero: extractComponent(components, 'street_number') || undefined,
                    rue: extractComponent(components, 'route'),
                    codePostal: extractComponent(components, 'postal_code'),
                    ville: extractComponent(components, 'locality'),
                    pays: extractComponent(components, 'country') || 'France',
                    latitude: place.geometry.location.lat(),
                    longitude: place.geometry.location.lng(),
                    googlePlaceId: place.place_id ?? '',
                });
            });
        };

        run().catch((err: unknown) => {
            console.error('[Autocomplete] erreur de chargement :', err);
        });

        return () => {
            listenerHandle?.remove();
        };
    }, [inputEl]); // se relance uniquement quand inputEl change (monte ou démonte)

    function clearAddress() {
        setDecomposedAddress(null);
        if (inputElRef.current) inputElRef.current.value = '';
    }

    return { inputRef, decomposedAddress, clearAddress };
}
