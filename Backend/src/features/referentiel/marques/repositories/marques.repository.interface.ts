import { MarqueDto } from '../dto/marque.dto';

export interface IMarquesRepository {
    findAll(): Promise<MarqueDto[]>;
    findById(id: string): Promise<MarqueDto | null>;
    findByLibelle(libelle: string): Promise<MarqueDto | null>;
    create(libelle: string): Promise<MarqueDto>;
    update(id: string, libelle: string): Promise<MarqueDto>;
    delete(id: string): Promise<void>;
}
