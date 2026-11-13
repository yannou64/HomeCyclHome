import { IndisponibiliteResponseDto } from '../dto/output/indisponibilite-response.dto';
import { IPlanningRepository } from '../repositories/planning.repository.interface';

export class GetIndisponibilitesUseCase {
    constructor(private readonly repo: IPlanningRepository) {}

    execute(technicienId: string): Promise<IndisponibiliteResponseDto[]> {
        return this.repo.findIndisponibilitesByTechnicien(technicienId);
    }
}
