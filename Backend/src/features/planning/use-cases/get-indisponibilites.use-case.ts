import { IndisponibiliteDto } from '../dto/planning.dto';
import { IPlanningRepository } from '../repositories/planning.repository.interface';

export class GetIndisponibilitesUseCase {
    constructor(private readonly repo: IPlanningRepository) {}

    execute(technicienId: string): Promise<IndisponibiliteDto[]> {
        return this.repo.findIndisponibilitesByTechnicien(technicienId);
    }
}
