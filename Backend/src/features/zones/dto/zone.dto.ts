export type ZonePointDto = {
    latitude: number;
    longitude: number;
    ordre: number;
};

export type ZoneDto = {
    id: string;
    nomZone: string;
    isActive: boolean;
    dateCreation: Date;
    points: ZonePointDto[];
};
