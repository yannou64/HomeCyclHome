import { ApiProperty } from '@nestjs/swagger';
import { ZoneCouverteResponseDto } from './couverture-mois-response.dto';

/** Un créneau de la journée d'un technicien, placé en heure de Paris. */
export class CreneauJourneeResponseDto {
    @ApiProperty({
        description: 'Minutes après minuit, heure de Paris (480 = 8h00)',
    })
    debut!: number;

    @ApiProperty({ enum: ['Libre', 'InterventionReservee', 'Deplacement'] })
    statut!: 'Libre' | 'InterventionReservee' | 'Deplacement';
}

/** Carte d'un technicien pour la date pivot (RG5, RG8). */
export class TechnicienJourneeResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    prenom!: string;

    @ApiProperty()
    nom!: string;

    // Sa zone du jour (une seule, RG2 de l'épique) ; null sans créneau ce jour
    @ApiProperty({ type: () => ZoneCouverteResponseDto, nullable: true })
    zone!: ZoneCouverteResponseDto | null;

    // Triés par heure ; vide sans créneau ce jour
    @ApiProperty({ type: () => [CreneauJourneeResponseDto] })
    creneaux!: CreneauJourneeResponseDto[];

    // RG5 : jour de son dernier créneau ; null = « non planifié »
    @ApiProperty({ nullable: true, example: '2026-12-12' })
    planifieJusquau!: string | null;
}

/** Carte d'une zone pour la date pivot (RG6, RG9). */
export class ZoneJourneeResponseDto extends ZoneCouverteResponseDto {
    // RG9 : 'non couverte' sans créneau ce jour ; 'complet' sans créneau Libre
    @ApiProperty({ enum: ['disponible', 'complet', 'non couverte'] })
    etat!: 'disponible' | 'complet' | 'non couverte';

    // RG9 : débuts des tranches de 30 min où au moins un technicien de la zone
    // a un créneau Libre, cumulés sans être comptés
    @ApiProperty({
        type: [Number],
        description: 'Minutes après minuit, heure de Paris',
    })
    tranchesLibres!: number[];

    // RG6 : dernier jour où la zone a un créneau ; null = « aucune couverture »
    @ApiProperty({ nullable: true, example: '2027-01-10' })
    derniereCouverture!: string | null;
}

/** La journée pivot : une carte par technicien, une carte par zone. */
export class JourneeResponseDto {
    @ApiProperty({ example: '2026-11-23' })
    date!: string;

    @ApiProperty({ type: () => [TechnicienJourneeResponseDto] })
    techniciens!: TechnicienJourneeResponseDto[];

    @ApiProperty({ type: () => [ZoneJourneeResponseDto] })
    zones!: ZoneJourneeResponseDto[];
}
