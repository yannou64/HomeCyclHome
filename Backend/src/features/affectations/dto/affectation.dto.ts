import { ApiProperty } from '@nestjs/swagger';

export class ZoneAffecteeDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    nomZone: string;

    @ApiProperty()
    isActive: boolean;
}

export class AffectationDto {
    @ApiProperty()
    technicienId: string;

    @ApiProperty()
    nom: string;

    @ApiProperty()
    prenom: string;

    @ApiProperty()
    email: string;

    @ApiProperty({ type: () => [ZoneAffecteeDto] })
    zones: ZoneAffecteeDto[];
}
