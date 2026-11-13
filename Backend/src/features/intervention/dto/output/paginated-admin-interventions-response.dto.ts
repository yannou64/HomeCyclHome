import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaResponseDto } from '../../../../shared/dto/pagination-meta-response.dto';
import { AdminInterventionListItemResponseDto } from './admin-intervention-list-item-response.dto';

export class PaginatedAdminInterventionsResponseDto {
    @ApiProperty({ type: () => [AdminInterventionListItemResponseDto] })
    data!: AdminInterventionListItemResponseDto[];

    @ApiProperty({ type: () => PaginationMetaResponseDto })
    meta!: PaginationMetaResponseDto;
}
