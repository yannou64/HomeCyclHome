export type ZoneAffectee = {
  id: string;
  nomZone: string;
  isActive: boolean;
};

export type Affectation = {
  technicienId: string;
  nom: string;
  prenom: string;
  email: string;
  zones: ZoneAffectee[];
};

export type SetTechnicienZonesPayload = {
  zoneIds: string[];
};
