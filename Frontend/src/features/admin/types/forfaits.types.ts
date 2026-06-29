export type Forfait = {
  id: string;
  nom: string;
  description: string | null;
  dureeMinutes: number;
  isActif: boolean;
  prixActif: number | null;
};

export type ForfaitPayload = {
  nom: string;
  description?: string;
  dureeMinutes: number;
  isActif?: boolean;
};
