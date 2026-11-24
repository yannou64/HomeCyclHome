import { ApiProperty } from '@nestjs/swagger';
import { CouvertureMoisResponseDto } from './couverture-mois-response.dto';

/** Le technicien dont on consulte la page : de quoi titrer la page. */
export class CalendrierTechnicienTechnicienResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    prenom!: string;

    @ApiProperty()
    nom!: string;
}

/**
 * Calendrier d'un technicien pour un mois (US-01 « Consulter le calendrier et
 * la journée d'un technicien 2.0 »). Même format que le calendrier de
 * couverture, réduit à ce technicien : chaque jour planifié a une seule zone
 * (RG2), un jour absent n'a aucun créneau. L'interface réutilise ainsi le même
 * composant de calendrier.
 */
export class CalendrierTechnicienResponseDto extends CouvertureMoisResponseDto {
    @ApiProperty({ type: CalendrierTechnicienTechnicienResponseDto })
    technicien!: CalendrierTechnicienTechnicienResponseDto;
}
