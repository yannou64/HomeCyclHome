export type ZonePoint = {
  latitude: number;
  longitude: number;
  ordre: number;
};

export type Zone = {
  id: string;
  nomZone: string;
  isActive: boolean;
  dateCreation: string;
  points: ZonePoint[];
};

export type CreateZonePayload = {
  nomZone: string;
  points: ZonePoint[];
};

export type UpdateZonePayload = {
  nomZone?: string;
  isActive?: boolean;
  points?: ZonePoint[];
};
