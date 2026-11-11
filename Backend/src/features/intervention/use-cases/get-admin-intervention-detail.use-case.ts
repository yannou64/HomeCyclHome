import { NotFoundException } from '@nestjs/common';
import type { IInterventionsRepository } from '../repositories/interventions.repository.interface';
import type { AdminInterventionDetailDto } from '../dto/output/admin-intervention-detail.dto';

export class GetAdminInterventionDetailUseCase {
    constructor(private readonly repo: IInterventionsRepository) {}

    async execute(id: string): Promise<AdminInterventionDetailDto> {
        const detail = await this.repo.findInterventionDetailById(id);
        if (!detail) throw new NotFoundException('Intervention non trouvée');
        return detail;
    }
}
