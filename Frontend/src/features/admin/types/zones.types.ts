export type ZonePoint = {
  latitude: number;
  longitude: number;
  ordre: number;
};

export type Zone = {
  id: string;
  nom_zone: string;
  is_active: boolean;
  date_creation: string;
  points: ZonePoint[];
};

export type CreateZonePayload = {
  nom_zone: string;
  points: ZonePoint[];
};

export type UpdateZonePayload = {
  nom_zone?: string;
  is_active?: boolean;
  points?: ZonePoint[];
};