export type ZoneAffectee = {
  id: string;
  nom_zone: string;
  is_active: boolean;
};

export type Affectation = {
  technicien_id: string;
  nom: string;
  prenom: string;
  email: string;
  zones: ZoneAffectee[];
};

export type SetTechnicienZonesPayload = {
  zone_ids: string[];
};