/**
 * Commentaire partagé — brique du socle (glossaire V2, « Commentaire partagé »).
 *
 * `Interventions.commentaire_technicien` est un seul champ texte, partagé par le
 * technicien, l'admin et le système, jamais visible du client. Chaque ajout est
 * concaténé EN TÊTE, précédé de la date, de l'heure et de l'auteur. Le texte
 * déjà écrit n'est jamais réécrit.
 *
 * Format d'une entrée (décision de Yannick du 16/11/2026), heure de Paris :
 *   16/11/2026 15:42 — Technicien : Déclarée réalisée : 55 €, Carte bancaire.
 *
 * Ce fichier ne fait que formater (fonction pure). L'ajout en base, atomique,
 * est dans shared/database/commentaire-partage.ts.
 */

export type AuteurCommentaire = 'Technicien' | 'Admin' | 'Système';

const FUSEAU = 'Europe/Paris';

/** Une entrée du commentaire partagé, sur une seule ligne. */
export function entreeCommentaire(
    maintenant: Date,
    auteur: AuteurCommentaire,
    texte: string,
): string {
    // Une ligne par entrée : les retours à la ligne saisis deviennent des espaces
    const surUneLigne = texte.replace(/\s*\n\s*/g, ' ').trim();
    if (surUneLigne === '') {
        throw new Error(
            'Une entrée du commentaire partagé ne peut pas être vide.',
        );
    }
    return `${horodatage(maintenant)} — ${auteur} : ${surUneLigne}`;
}

// « 16/11/2026 15:42 », dans le fuseau d'exploitation
function horodatage(instant: Date): string {
    const parties = new Intl.DateTimeFormat('fr-FR', {
        timeZone: FUSEAU,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(instant);
    const valeur = (type: Intl.DateTimeFormatPartTypes) =>
        parties.find((p) => p.type === type)?.value ?? '';
    return `${valeur('day')}/${valeur('month')}/${valeur('year')} ${valeur('hour')}:${valeur('minute')}`;
}
