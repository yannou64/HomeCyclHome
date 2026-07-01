import { useState } from 'react';
import { reservationService } from '../services/reservationService';
import type { ZoneInfo } from '../../../app/providers/reservationContext/types/reservation.types';

// Vérifie si une adresse est couverte par une zone active — retourne null si non couverte
export function useZoneCheck() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkZone = async (latitude: number, longitude: number): Promise<ZoneInfo | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await reservationService.checkZone(latitude, longitude);
    } catch {
      setError("Votre adresse n'est pas encore couverte par nos zones d'intervention.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { checkZone, isLoading, error };
}
