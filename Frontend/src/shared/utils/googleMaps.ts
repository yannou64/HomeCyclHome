import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

// Configuration de Google Maps, faite une seule fois pour toute l'application,
// à l'import de ce module : setOptions doit précéder tout importLibrary, et ne
// pas être rappelé ailleurs. La clé vient de l'environnement (jamais en dur).
setOptions({
    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    v: 'weekly',
});

// Seule porte d'entrée vers les bibliothèques Google Maps ('maps', 'places'…)
export { importLibrary };
