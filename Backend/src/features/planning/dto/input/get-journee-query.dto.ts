import { Matches } from 'class-validator';

/**
 * Paramètre d'URL de la journée pivot (US-02 « Consulter la journée des
 * techniciens et les disponibilités des zones 2.0 ») : un jour de Paris.
 */
export class GetJourneeQueryDto {
    @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
        message: 'La date est au format AAAA-MM-JJ.',
    })
    date!: string;
}
