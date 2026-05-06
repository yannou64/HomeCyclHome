import { useEffect, useRef, useState } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import type { ZonePoint } from '../../../types/zones.types';
import styles from './ZoneMapDrawer.module.scss';

// setOptions est appelé une seule fois au niveau module, avant tout importLibrary
setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  v: 'weekly',
});

const LYON_CENTER = { lat: 45.75, lng: 4.85 };
const DEFAULT_ZOOM = 11;

interface ZoneMapDrawerProps {
  initialPoints?: ZonePoint[];
  onChange: (points: ZonePoint[]) => void;
}

export function ZoneMapDrawer({ initialPoints, onChange }: ZoneMapDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const [vertices, setVertices] = useState<google.maps.LatLngLiteral[]>(
    initialPoints?.map((p) => ({ lat: p.latitude, lng: p.longitude })) ?? [],
  );

  // isMapReady passe à true quand la carte est initialisée,
  // ce qui déclenche le 2e useEffect même si vertices n'a pas changé
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialisation de la carte (une seule fois au montage)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initMap = async () => {
      // importLibrary remplace loader.load() — charge uniquement ce dont on a besoin
      const { Map } = await importLibrary('maps');

      if (!containerRef.current) return;

      const map = new Map(containerRef.current, {
        center: LYON_CENTER,
        zoom: DEFAULT_ZOOM,
        mapTypeId: 'roadmap',
        styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
      });

      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        setVertices((prev) => [...prev, { lat: e.latLng!.lat(), lng: e.latLng!.lng() }]);
      });

      mapRef.current = map;
      setIsMapReady(true);
    };

    void initMap();
  }, []);

  // Redessine le polygone et les marqueurs à chaque changement de vertices ou quand la carte est prête
  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    polygonRef.current?.setMap(null);

    if (vertices.length === 0) return;

    vertices.forEach((pos, index) => {
      const marker = new google.maps.Marker({
        position: pos,
        map: mapRef.current!,
        label: { text: String(index + 1), color: '#ffffff', fontSize: '12px' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#f26419',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      // Clic sur un marqueur → supprime ce sommet
      marker.addListener('click', () => {
        setVertices((prev) => prev.filter((_, i) => i !== index));
      });

      markersRef.current.push(marker);
    });

    if (vertices.length >= 3) {
      polygonRef.current = new google.maps.Polygon({
        paths: vertices,
        map: mapRef.current,
        fillColor: '#f26419',
        fillOpacity: 0.2,
        strokeColor: '#f26419',
        strokeOpacity: 0.8,
        strokeWeight: 2,
      });
    }

    onChange(vertices.map((v, i) => ({ latitude: v.lat, longitude: v.lng, ordre: i })));
  }, [vertices, onChange, isMapReady]);

  const handleClear = () => setVertices([]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span className={styles.hint}>
          Cliquez sur la carte pour ajouter des sommets · Cliquez sur un marqueur pour le supprimer
        </span>
        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClear}
          disabled={vertices.length === 0}
        >
          Effacer
        </button>
      </div>
      <div ref={containerRef} className={styles.map} />
      <p className={styles.counter}>
        {vertices.length} sommet{vertices.length !== 1 ? 's' : ''} défini{vertices.length !== 1 ? 's' : ''}
        {vertices.length > 0 && vertices.length < 3 && (
          <span className={styles.warning}> — minimum 3 requis</span>
        )}
      </p>
    </div>
  );
}
