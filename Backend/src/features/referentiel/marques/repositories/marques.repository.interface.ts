import { MarqueResponseDto } from '../dto/output/marque-response.dto';

export interface IMarquesRepository {
    findAll(): Promise<MarqueResponseDto[]>;
    findById(id: string): Promise<MarqueResponseDto | null>;
    findByLibelle(libelle: string): Promise<MarqueResponseDto | null>;
    create(libelle: string): Promise<MarqueResponseDto>;
    update(id: string, libelle: string): Promise<MarqueResponseDto>;
    delete(id: string): Promise<void>;
}
