import { AffectationDto } from '../dto/affectation.dto';

export const AFFECTATIONS_REPO = 'AFFECTATIONS_REPO';

export interface IAffectationsRepository {
    findAll(): Promise<AffectationDto[]>;
    findByTechnicienId(technicienId: string): Promise<AffectationDto | null>;
    // Vérifie que l'utilisateur existe ET a le rôle 'technicien'
    technicienExists(technicienId: string): Promise<boolean>;
    // Vérifie que tous les IDs de zones correspondent à des zones existantes
    zonesExist(zoneIds: string[]): Promise<boolean>;
    setZonesForTechnicien(
        technicienId: string,
        zoneIds: string[],
    ): Promise<AffectationDto>;
    deleteForTechnicien(technicienId: string): Promise<void>;
}
