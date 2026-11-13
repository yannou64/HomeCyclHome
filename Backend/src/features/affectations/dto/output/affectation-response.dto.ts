import { ApiProperty } from '@nestjs/swagger';

export class ZoneAffecteeResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    nomZone!: string;

    @ApiProperty()
    isActive!: boolean;
}

export class AffectationResponseDto {
    @ApiProperty()
    technicienId!: string;

    @ApiProperty()
    nom!: string;

    @ApiProperty()
    prenom!: string;

    @ApiProperty()
    email!: string;

    @ApiProperty({ type: () => [ZoneAffecteeResponseDto] })
    zones!: ZoneAffecteeResponseDto[];
}
