import { ForfaitResponseDto } from '../dto/output/forfait-response.dto';

export type CreateForfaitData = {
    nom: string;
    description?: string;
    dureeMinutes: number;
    isActif?: boolean;
};

export type UpdateForfaitData = Partial<CreateForfaitData>;

export interface IForfaitsRepository {
    findAll(): Promise<ForfaitResponseDto[]>;
    findAllActifs(): Promise<ForfaitResponseDto[]>;
    findById(id: string): Promise<ForfaitResponseDto | null>;
    findByNom(nom: string): Promise<ForfaitResponseDto | null>;
    create(data: CreateForfaitData): Promise<ForfaitResponseDto>;
    update(id: string, data: UpdateForfaitData): Promise<ForfaitResponseDto>;
    delete(id: string): Promise<void>;
    setPrix(forfaitId: string, montant: number, dateDebut: Date): Promise<void>;
}
