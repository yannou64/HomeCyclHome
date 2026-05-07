import { ZoneDto } from '../dto/zone.dto';

export type ZonePointData = {
    latitude: number;
    longitude: number;
    ordre: number;
};

export type CreateZoneData = {
    nom_zone: string;
    points: ZonePointData[];
};

export type UpdateZoneData = {
    nom_zone?: string;
    is_active?: boolean;
    points?: ZonePointData[];
};

export const ZONES_REPO = 'ZONES_REPO';

export interface IZonesRepository {
    findAll(): Promise<ZoneDto[]>;
    findById(id: string): Promise<ZoneDto | null>;
    existsByNom(nom: string, excludeId?: string): Promise<boolean>;
    create(data: CreateZoneData): Promise<ZoneDto>;
    update(id: string, data: UpdateZoneData): Promise<ZoneDto>;
    delete(id: string): Promise<void>;
}
