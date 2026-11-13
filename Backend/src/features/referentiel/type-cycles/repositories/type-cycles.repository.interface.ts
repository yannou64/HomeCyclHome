import { TypeCycleResponseDto } from '../dto/output/type-cycle-response.dto';

export interface ITypeCyclesRepository {
    findAll(): Promise<TypeCycleResponseDto[]>;
    findById(id: string): Promise<TypeCycleResponseDto | null>;
    findByLibelle(libelle: string): Promise<TypeCycleResponseDto | null>;
    create(libelle: string): Promise<TypeCycleResponseDto>;
    update(id: string, libelle: string): Promise<TypeCycleResponseDto>;
    delete(id: string): Promise<void>;
}
