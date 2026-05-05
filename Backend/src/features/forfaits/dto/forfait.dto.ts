export type ForfaitDto = {
  id: string;
  nom: string;
  description: string | null;
  duree_minutes: number;
  is_actif: boolean;
  prix_actif: number | null;
};
