import { CycleResponseDto } from '../dto/output/cycle-response.dto';
import { CreateCycleInput } from '../dto/input/create-cycle.dto';
import { UpdateCycleInput } from '../dto/input/update-cycle.dto';

// Jeton d'injection : l'interface disparaît à la compilation, Nest
// retrouve l'implémentation par ce nom (voir le module).
export const CYCLES_REPO = 'CYCLES_REPO';

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
