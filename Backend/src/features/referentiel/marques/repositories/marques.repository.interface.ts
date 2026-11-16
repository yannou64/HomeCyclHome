import { MarqueResponseDto } from '../dto/output/marque-response.dto';

// Jeton d'injection : l'interface disparaît à la compilation, Nest
// retrouve l'implémentation par ce nom (voir le module).
export const MARQUES_REPO = 'MARQUES_REPO';

export interface IMarquesRepository {
    findAll(): Promise<MarqueResponseDto[]>;
    findById(id: string): Promise<MarqueResponseDto | null>;
    findByLibelle(libelle: string): Promise<MarqueResponseDto | null>;
    create(libelle: string): Promise<MarqueResponseDto>;
    update(id: string, libelle: string): Promise<MarqueResponseDto>;
    delete(id: string): Promise<void>;
}
