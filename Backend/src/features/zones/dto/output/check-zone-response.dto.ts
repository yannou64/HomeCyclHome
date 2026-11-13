import { ApiProperty } from '@nestjs/swagger';

export class CheckZoneResponseDto {
    @ApiProperty()
    zoneId!: string;

    @ApiProperty()
    nomZone!: string;
}
