import { useEffect, useRef } from 'react';
import { importLibrary } from '../../../../../shared/utils/googleMaps';
import type { ZonePoint } from '../../../types/zones.types';
import styles from './ZoneMiniature.module.scss';

interface ZoneMiniatureProps {
    nomZone: string;
    points: ZonePoint[]; // tracé de la zone (route des zones, déjà triée)
    couleur: string; // teinte affichée de la zone (gris si inactive)
}

/**
 * Miniature du tracé d'une zone, dans sa carte de la page Planning (écart du
 * 22/11/2026 : demandée par la maquette, ajoutée à la spec). Carte figée :
 * ni contrôles, ni glisser, ni zoom ; elle se cadre sur le tracé.
 *
 * Google Maps vit hors de React : les effets ne font que se synchroniser avec
 * lui (créer la carte, redessiner le polygone), sans aucun setState.
 */
export function ZoneMiniature({
    nomZone,
    points,
    couleur,
}: ZoneMiniatureProps) {
    const conteneurRef = useRef<HTMLDivElement>(null);
    const carteRef = useRef<google.maps.Map | null>(null);
    const polygoneRef = useRef<google.maps.Polygon | null>(null);

    useEffect(() => {
        // Un tracé a au moins trois points ; sinon, rien à dessiner
        if (points.length < 3 || !conteneurRef.current) return;
        let annule = false;

        void (async () => {
            const { Map, Polygon } = await importLibrary('maps');
            if (annule || !conteneurRef.current) return;

            // Créée une seule fois, puis réutilisée quand la zone change
            carteRef.current ??= new Map(conteneurRef.current, {
                disableDefaultUI: true,
                gestureHandling: 'none',
                keyboardShortcuts: false,
                clickableIcons: false,
                styles: [
                    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
                ],
            });

            const chemin = points.map((p) => ({
                lat: p.latitude,
                lng: p.longitude,
            }));
            polygoneRef.current?.setMap(null);
            polygoneRef.current = new Polygon({
                paths: chemin,
                map: carteRef.current,
                fillColor: couleur,
                fillOpacity: 0.3,
                strokeColor: couleur,
                strokeWeight: 2,
                clickable: false,
            });

            // Cadrage sur le tracé, avec une petite marge
            const cadre = new google.maps.LatLngBounds();
            chemin.forEach((p) => cadre.extend(p));
            carteRef.current.fitBounds(cadre, 8);
        })();

        return () => {
            annule = true;
        };
    }, [points, couleur]);

    if (points.length < 3) {
        return <p className={styles.vide}>Tracé indisponible</p>;
    }

    return (
        <div
            ref={conteneurRef}
            className={styles.miniature}
            role="img"
            aria-label={`Tracé de la zone ${nomZone}`}
        />
    );
}
