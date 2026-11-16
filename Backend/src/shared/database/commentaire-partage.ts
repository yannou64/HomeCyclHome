/**
 * Ajout au commentaire partagé — brique du socle (glossaire V2).
 *
 * Une seule requête SQL place la nouvelle entrée EN TÊTE du texte existant :
 *   commentaire = nouvelle entrée || saut de ligne || ancien commentaire
 *
 * Le code ne relit jamais le texte pour le réécrire (« le texte déjà écrit n'est
 * jamais réécrit ») : c'est PostgreSQL qui concatène, sur la ligne verrouillée.
 * Deux ajouts simultanés ne s'écrasent donc pas : le second attend le premier,
 * puis concatène sur la version à jour. Un « lire, concaténer, écrire » en
 * TypeScript perdrait l'une des deux entrées.
 *
 * L'entrée se formate avec entreeCommentaire (shared/domain/commentaire-partage).
 * Appelée avec le `tx` d'une transaction, elle en fait partie (« tout ou rien »
 * des US : statut, créneaux et commentaire).
 */
import type { Prisma } from '../../generated/prisma/client';

/**
 * Ajoute une entrée en tête du commentaire partagé d'une intervention.
 * Renvoie le nombre de lignes modifiées : 1, ou 0 si l'intervention n'existe pas
 * (à vérifier avec exigerLignesModifiees si l'appelant l'exige).
 */
export function ajouterAuCommentaire(
    tx: Prisma.TransactionClient,
    interventionId: string,
    entree: string,
): Promise<number> {
    // COALESCE : un commentaire vide (NULL) devient l'entrée seule, sans saut de
    // ligne. date_maj : Prisma la remplit lui-même (@updatedAt), mais pas lors
    // d'une requête SQL brute ; on la pose en UTC, comme Prisma stocke ses dates.
    return tx.$executeRaw`
        UPDATE "Interventions"
        SET commentaire_technicien =
                ${entree} || COALESCE(E'\n' || commentaire_technicien, ''),
            date_maj = (now() AT TIME ZONE 'UTC')
        WHERE id = ${interventionId}
    `;
}
