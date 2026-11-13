import { NotFoundException } from '@nestjs/common';
import type { IInterventionsRepository } from '../repositories/interventions.repository.interface';
import type { AdminInterventionDetailResponseDto } from '../dto/output/admin-intervention-detail-response.dto';

export class GetAdminInterventionDetailUseCase {
    constructor(private readonly repo: IInterventionsRepository) {}

    async execute(id: string): Promise<AdminInterventionDetailResponseDto> {
        const detail = await this.repo.findInterventionDetailById(id);
        if (!detail) throw new NotFoundException('Intervention non trouvée');
        return detail;
    }
}
