import { TypeCycleDto } from '../dto/type-cycle.dto';

export interface ITypeCyclesRepository {
    findAll(): Promise<TypeCycleDto[]>;
    findById(id: string): Promise<TypeCycleDto | null>;
    findByLibelle(libelle: string): Promise<TypeCycleDto | null>;
    create(libelle: string): Promise<TypeCycleDto>;
    update(id: string, libelle: string): Promise<TypeCycleDto>;
    delete(id: string): Promise<void>;
}
