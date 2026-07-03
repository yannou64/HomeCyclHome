import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../../shared/dto/pagination-meta.dto';
import { AdminInterventionListItemDto } from './admin-intervention-list-item.dto';

export class PaginatedAdminInterventionsDto {
    @ApiProperty({ type: () => [AdminInterventionListItemDto] })
    data: AdminInterventionListItemDto[];

    @ApiProperty({ type: () => PaginationMetaDto })
    meta: PaginationMetaDto;
}
