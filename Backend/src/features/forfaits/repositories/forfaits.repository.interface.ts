import { ForfaitDto } from '../dto/forfait.dto';

export type CreateForfaitData = {
    nom: string;
    description?: string;
    duree_minutes: number;
    is_actif?: boolean;
};

export type UpdateForfaitData = Partial<CreateForfaitData>;

export interface IForfaitsRepository {
    findAll(): Promise<ForfaitDto[]>;
    findById(id: string): Promise<ForfaitDto | null>;
    findByNom(nom: string): Promise<ForfaitDto | null>;
    create(data: CreateForfaitData): Promise<ForfaitDto>;
    update(id: string, data: UpdateForfaitData): Promise<ForfaitDto>;
    delete(id: string): Promise<void>;
    setPrix(forfaitId: string, montant: number, dateDebut: Date): Promise<void>;
}
