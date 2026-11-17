import { ZoneResponseDto } from '../dto/output/zone-response.dto';
import type { CouleurZone } from '../dto/couleur-zone';

export type ZonePointData = {
    latitude: number;
    longitude: number;
    ordre: number;
};

export type CreateZoneData = {
    nomZone: string;
    couleur: CouleurZone;
    points: ZonePointData[];
};

export type UpdateZoneData = {
    nomZone?: string;
    isActive?: boolean;
    couleur?: CouleurZone;
    points?: ZonePointData[];
};

export const ZONES_REPO = 'ZONES_REPO';

export interface IZonesRepository {
    findAll(): Promise<ZoneResponseDto[]>;
    findAllActive(): Promise<ZoneResponseDto[]>;
    findById(id: string): Promise<ZoneResponseDto | null>;
    existsByNom(nom: string, excludeId?: string): Promise<boolean>;
    create(data: CreateZoneData): Promise<ZoneResponseDto>;
    update(id: string, data: UpdateZoneData): Promise<ZoneResponseDto>;
    delete(id: string): Promise<void>;
}
