import { IsOptional, Matches } from 'class-validator';

/**
 * Paramètre d'URL du calendrier de couverture (US-01 « Consulter le
 * calendrier de couverture et choisir une date 2.0 »). Absent : le mois du
 * jour, calculé dans le fuseau d'exploitation (RG4).
 */
export class GetCouvertureQueryDto {
    @IsOptional()
    // AAAA-MM, mois de 01 à 12 : n'importe quel mois, passé compris (RG12)
    @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
        message: 'Le mois est au format AAAA-MM.',
    })
    mois?: string;
}
