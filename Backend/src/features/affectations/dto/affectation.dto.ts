export type ZoneAffecteeDto = {
    id: string;
    nomZone: string;
    isActive: boolean;
};

export type AffectationDto = {
    technicienId: string;
    nom: string;
    prenom: string;
    email: string;
    zones: ZoneAffecteeDto[];
};
