import { TypeCycleResponseDto } from '../dto/output/type-cycle-response.dto';

// Jeton d'injection : l'interface disparaît à la compilation, Nest
// retrouve l'implémentation par ce nom (voir le module).
export const TYPE_CYCLES_REPO = 'TYPE_CYCLES_REPO';

export interface ITypeCyclesRepository {
    findAll(): Promise<TypeCycleResponseDto[]>;
    findById(id: string): Promise<TypeCycleResponseDto | null>;
    findByLibelle(libelle: string): Promise<TypeCycleResponseDto | null>;
    create(libelle: string): Promise<TypeCycleResponseDto>;
    update(id: string, libelle: string): Promise<TypeCycleResponseDto>;
    delete(id: string): Promise<void>;
}
