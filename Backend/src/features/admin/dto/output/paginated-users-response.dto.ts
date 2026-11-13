import { ApiProperty } from '@nestjs/swagger';
import { AdminUserResponseDto } from './admin-user-response.dto';
import { PaginationMetaResponseDto } from '../../../../shared/dto/pagination-meta-response.dto';

export class PaginatedUsersResponseDto {
    @ApiProperty({ type: () => [AdminUserResponseDto] })
    data!: AdminUserResponseDto[];

    @ApiProperty({ type: () => PaginationMetaResponseDto })
    meta!: PaginationMetaResponseDto;
}
