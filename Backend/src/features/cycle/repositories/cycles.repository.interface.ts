import { CycleDto } from '../dto/output/cycle.dto';
import { CreateCycleInput, UpdateCycleInput } from '../dto/input/cycle-input.dto';

export interface ICyclesRepository {
    findAllByUser(utilisateurId: string): Promise<CycleDto[]>;
    findById(id: string): Promise<CycleDto | null>;
    create(utilisateurId: string, data: CreateCycleInput): Promise<CycleDto>;
    update(id: string, data: UpdateCycleInput): Promise<CycleDto>;
    delete(id: string): Promise<void>;
}
