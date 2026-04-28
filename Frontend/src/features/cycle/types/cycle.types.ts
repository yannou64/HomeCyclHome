export type Marque = { id: string; libelle: string };
export type TypeCycle = { id: string; libelle: string };

export type Cycle = {
    id: string;
    libelle: string;
    particularite: string | null;
    dateCreation: string;
    utilisateurId: string;
    marque: Marque;
    typeCycle: TypeCycle;
};

export type CreateCyclePayload = {
    libelle: string;
    marqueId: string;
    typeCycleId: string;
    particularite?: string;
};

export type UpdateCyclePayload = Partial<CreateCyclePayload>;
