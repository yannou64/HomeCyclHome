export type ZonePointDto = {
    latitude: number;
    longitude: number;
    ordre: number;
};

export type ZoneDto = {
    id: string;
    nom_zone: string;
    is_active: boolean;
    date_creation: Date;
    points: ZonePointDto[];
};
