import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { INTERVENTIONS_REPO } from '../intervention.module';
import type { IInterventionsRepository } from '../repositories/interventions.repository.interface';
import type { AdminInterventionDetailDto } from '../dto/output/admin-intervention-detail.dto';

@Injectable()
export class GetAdminInterventionDetailUseCase {
    constructor(
        @Inject(INTERVENTIONS_REPO)
        private readonly repo: IInterventionsRepository,
    ) {}

    async execute(id: string): Promise<AdminInterventionDetailDto> {
        const detail = await this.repo.findInterventionDetailById(id);
        if (!detail) throw new NotFoundException('Intervention non trouvée');
        return detail;
    }
}
