export type ZoneAffecteeDto = {
  id: string;
  nom_zone: string;
  is_active: boolean;
};

export type AffectationDto = {
  technicien_id: string;
  nom: string;
  prenom: string;
  email: string;
  zones: ZoneAffecteeDto[];
};