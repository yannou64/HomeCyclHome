import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Le client : de quoi le nommer et le joindre (RG4). */
export class InterventionTechnicienClientResponseDto {
    @ApiProperty()
    prenom!: string;

    @ApiProperty()
    nom!: string;

    @ApiProperty()
    telephone!: string;

    @ApiProperty()
    email!: string;
}

/** Le cycle, par sa marque et son type ; jamais le libellé du client (RG4). */
export class InterventionTechnicienCycleResponseDto {
    @ApiProperty()
    marque!: string;

    @ApiProperty()
    type!: string;
}

/** L'adresse de l'intervention, celle que le technicien rejoint (RG4). */
export class InterventionTechnicienAdresseResponseDto {
    @ApiPropertyOptional({ type: String, nullable: true })
    numero!: string | null;

    @ApiProperty()
    rue!: string;

    @ApiProperty()
    codePostal!: string;

    @ApiProperty()
    ville!: string;
}

/**
 * Une intervention du jour sur la page d'un technicien (US-02 « Consulter les
 * interventions d'un technicien 2.0 »). Lecture seule.
 */
export class InterventionTechnicienResponseDto {
    @ApiProperty()
    id!: string;

    // 'EnConflit' : la page affiche le repère « en conflit » (CA11)
    @ApiProperty({ enum: ['Planifiee', 'Realisee', 'Annulee', 'EnConflit'] })
    statut!: 'Planifiee' | 'Realisee' | 'Annulee' | 'EnConflit';

    // Début du premier créneau réservé et fin du dernier, en minutes
    // d'horloge à Paris (510 = 8h30) : le bloc hors déplacements
    @ApiProperty({ description: 'Minutes après minuit, heure de Paris' })
    debut!: number;

    @ApiProperty({ description: 'Minutes après minuit, heure de Paris' })
    fin!: number;

    @ApiProperty()
    forfait!: string;

    @ApiProperty({ type: InterventionTechnicienClientResponseDto })
    client!: InterventionTechnicienClientResponseDto;

    @ApiProperty({ type: InterventionTechnicienCycleResponseDto })
    cycle!: InterventionTechnicienCycleResponseDto;

    @ApiProperty({ type: InterventionTechnicienAdresseResponseDto })
    adresse!: InterventionTechnicienAdresseResponseDto;
}
