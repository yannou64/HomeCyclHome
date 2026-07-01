import { apiClient } from '../../../shared/services/apiClient';
import type {
    CreateInterventionRequest,
    InterventionCreatedDto,
} from '../types/intervention.types';

// Aplatit AdresseBooking (union discriminée frontend) en objet plat attendu par le backend
function mapAdresse(adresse: CreateInterventionRequest['adresse']) {
    if (adresse.source === 'saved') {
        return {
            source: 'saved' as const,
            adresseId: adresse.data.adresseId,
        };
    }
    return {
        source: 'autocomplete' as const,
        rue: adresse.data.rue,
        codePostal: adresse.data.codePostal,
        ville: adresse.data.ville,
        latitude: adresse.data.latitude,
        longitude: adresse.data.longitude,
        googlePlaceId: adresse.data.googlePlaceId,
        numero: adresse.data.numero,
    };
}

// Aplatit CycleBooking (objet frontend avec libellés) en objet plat attendu par le backend
function mapCycle(cycle: CreateInterventionRequest['cycle']) {
    if (cycle.source === 'existing') {
        return { source: 'existing' as const, cycleId: cycle.cycleId };
    }
    return {
        source: 'new' as const,
        typeCycleId: cycle.typeCycleId,
        marqueId: cycle.marqueId,
    };
}

export const interventionService = {
    async create(request: CreateInterventionRequest): Promise<InterventionCreatedDto> {
        const payload = {
            adresse: mapAdresse(request.adresse),
            cycle: mapCycle(request.cycle),
            forfaitId: request.forfaitId,
            creneauId: request.creneauId,
            commentaire: request.commentaire,
        };
        const r = await apiClient.post<InterventionCreatedDto>('/interventions', payload);
        return r.data;
    },

    // FormData est détecté automatiquement par Axios — pas besoin de Content-Type manuel
    async uploadPhotos(
        interventionId: string,
        photos: File[],
    ): Promise<{ count: number; urls: string[] }> {
        const form = new FormData();
        photos.forEach((f) => form.append('photos', f));
        const r = await apiClient.post<{ count: number; urls: string[] }>(
            `/interventions/${interventionId}/photos`,
            form,
        );
        return r.data;
    },
};
