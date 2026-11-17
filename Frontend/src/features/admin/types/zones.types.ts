import type { CouleurZone } from '../../../shared/utils/couleursZones';

export type ZonePoint = {
    latitude: number;
    longitude: number;
    ordre: number;
};

export type Zone = {
    id: string;
    nomZone: string;
    isActive: boolean;
    couleur: CouleurZone; // le nom (« Bleu »), jamais le code hexadécimal
    dateCreation: string;
    points: ZonePoint[];
};

export type CreateZonePayload = {
    nomZone: string;
    couleur: CouleurZone;
    points: ZonePoint[];
};

export type UpdateZonePayload = {
    nomZone?: string;
    isActive?: boolean;
    couleur?: CouleurZone;
    points?: ZonePoint[];
};
