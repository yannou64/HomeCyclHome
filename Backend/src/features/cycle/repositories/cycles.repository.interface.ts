import { CycleResponseDto } from '../dto/output/cycle-response.dto';
import { CreateCycleInput } from '../dto/input/create-cycle.dto';
import { UpdateCycleInput } from '../dto/input/update-cycle.dto';

export interface ICyclesRepository {
    findAllByUser(utilisateurId: string): Promise<CycleResponseDto[]>;
    findById(id: string): Promise<CycleResponseDto | null>;
    create(
        utilisateurId: string,
        data: CreateCycleInput,
    ): Promise<CycleResponseDto>;
    update(id: string, data: UpdateCycleInput): Promise<CycleResponseDto>;
    delete(id: string): Promise<void>;
}
