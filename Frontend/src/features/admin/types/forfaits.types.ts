export type Forfait = {
  id: string;
  nom: string;
  description: string | null;
  duree_minutes: number;
  is_actif: boolean;
  prix_actif: number | null;
};

export type ForfaitPayload = {
  nom: string;
  description?: string;
  duree_minutes: number;
  is_actif?: boolean;
};