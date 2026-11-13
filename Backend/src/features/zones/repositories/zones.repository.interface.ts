import { ZoneResponseDto } from '../dto/output/zone-response.dto';

export type ZonePointData = {
    latitude: number;
    longitude: number;
    ordre: number;
};

export type CreateZoneData = {
    nomZone: string;
    points: ZonePointData[];
};

export type UpdateZoneData = {
    nomZone?: string;
    isActive?: boolean;
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
