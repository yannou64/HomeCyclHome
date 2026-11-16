import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import {
    INTERVENTIONS_REPO,
    type IInterventionsRepository,
} from '../repositories/interventions.repository.interface';
import type { AdminInterventionDetailResponseDto } from '../dto/output/admin-intervention-detail-response.dto';

@Injectable()
export class GetAdminInterventionDetailUseCase {
    constructor(
        @Inject(INTERVENTIONS_REPO)
        private readonly repo: IInterventionsRepository,
    ) {}

    async execute(id: string): Promise<AdminInterventionDetailResponseDto> {
        const detail = await this.repo.findInterventionDetailById(id);
        if (!detail) throw new NotFoundException('Intervention non trouvée');
        return detail;
    }
}
