import type { InterventionListItemResponseDto } from '../dto/output/intervention-list-item-response.dto';
import type { AdminInterventionListItemResponseDto } from '../dto/output/admin-intervention-list-item-response.dto';
import type { AdminInterventionDetailResponseDto } from '../dto/output/admin-intervention-detail-response.dto';

// Jeton d'injection : l'interface disparaît à la compilation, Nest
// retrouve l'implémentation par ce nom (voir le module).
export const INTERVENTIONS_REPO = 'INTERVENTIONS_REPO';

export type GetAdminInterventionsParams = {
    statut?: 'Planifiee' | 'enRetard' | 'archivees';
    zoneId?: string;
    technicienId?: string;
    page: number;
    limit: number;
};

export interface IInterventionsRepository {
    getInterventionsByClientId(
        clientId: string,
    ): Promise<InterventionListItemResponseDto[]>;
    findAllInterventions(params: GetAdminInterventionsParams): Promise<{
        interventions: AdminInterventionListItemResponseDto[];
        total: number;
    }>;
    findInterventionDetailById(
        id: string,
    ): Promise<AdminInterventionDetailResponseDto | null>;
    // --- Photos ---
    isInterventionOwnedByClient(
        interventionId: string,
        clientId: string,
    ): Promise<boolean>;
    getPhotosCount(interventionId: string): Promise<number>;
    createPhotos(
        interventionId: string,
        photos: { urlS3: string; cleS3: string }[],
        contexte: 'client' | 'technicien',
    ): Promise<void>;
}
