import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { CreateModelePlanificationDto } from './create-modele-planification.dto';

// Un jour de Paris au format AAAA-MM-JJ (même format que la journée pivot)
const FORMAT_JOUR = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/**
 * Saisie d'une planification (« Planifier un technicien 2.0 ») : la zone, les
 * jours et les blocs d'un modèle, sans intitulé (la planification libre
 * n'enregistre aucun modèle, RG12), plus la période.
 *
 * `OmitType` recopie les champs du DTO de création **avec leurs décorateurs
 * de validation** : bornes et pas des blocs, au moins un bloc, au moins un
 * jour (RG2, RG6) ne sont écrits qu'une fois. Ce qui dépend de plusieurs
 * valeurs (blocs entre eux, dates entre elles, demain, zone) est contrôlé par
 * le use case.
 *
 * Reçu par l'aperçu (US-02) et par la génération (US-03) : le verbe est celui
 * de la génération, l'opération principale.
 */
export class PlanifierTechnicienDto extends OmitType(
    CreateModelePlanificationDto,
    ['intitule'] as const,
) {
    @ApiProperty({ example: '2026-12-01' })
    @Matches(FORMAT_JOUR, {
        message: 'La date de début est obligatoire, au format AAAA-MM-JJ.',
    })
    dateDebut!: string;

    @ApiProperty({ example: '2026-12-31' })
    @Matches(FORMAT_JOUR, {
        message: 'La date de fin est obligatoire, au format AAAA-MM-JJ.',
    })
    dateFin!: string;
}
