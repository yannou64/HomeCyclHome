import { AffectationResponseDto } from '../dto/output/affectation-response.dto';

export const AFFECTATIONS_REPO = 'AFFECTATIONS_REPO';

export interface IAffectationsRepository {
    findAll(): Promise<AffectationResponseDto[]>;
    findByTechnicienId(
        technicienId: string,
    ): Promise<AffectationResponseDto | null>;
    // Vérifie que l'utilisateur existe ET a le rôle 'technicien'
    technicienExists(technicienId: string): Promise<boolean>;
    // Vérifie que tous les IDs de zones correspondent à des zones existantes
    zonesExist(zoneIds: string[]): Promise<boolean>;
    setZonesForTechnicien(
        technicienId: string,
        zoneIds: string[],
    ): Promise<AffectationResponseDto>;
    deleteForTechnicien(technicienId: string): Promise<void>;
}
