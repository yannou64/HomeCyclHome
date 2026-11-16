/**
 * Écriture conditionnelle — brique partagée du socle (glossaire V2, « Écritures »).
 *
 * Une écriture qui dépend d'un état attendu se fait par un `updateMany` dont le
 * `where` contient cet état (« seulement si le créneau est encore Libre »), puis
 * on lit le **nombre de lignes modifiées** :
 * - le nombre attendu → la condition était remplie ;
 * - moins → l'état a changé entre-temps (une autre requête est passée avant) :
 *   on lance EtatModifieEntreTempsError, ce qui annule toute la transaction.
 *
 * C'est ce qui règle deux requêtes simultanées sur le même objet : PostgreSQL
 * verrouille la ligne pendant la première, la seconde réévalue son `where` après
 * la validation de la première, ne trouve plus l'état attendu, et modifie 0 ligne.
 * Ne jamais remplacer par « lire puis écrire » sans condition.
 *
 * Usage, dans une méthode de repository :
 *   try {
 *       await this.prisma.$transaction(async (tx) => {
 *           const r = await tx.creneau.updateMany({ where: { id, statut: 'Libre' }, data });
 *           exigerLignesModifiees(r);
 *           // … autres écritures du même « tout ou rien »
 *       });
 *       return { ok: true };
 *   } catch (err) {
 *       if (estEtatModifieEntreTemps(err)) return { ok: false };
 *       throw err;
 *   }
 * Le use case traduit `ok: false` en ConflictException avec le message de la spec.
 */

/** L'état attendu a changé entre la lecture et l'écriture : transaction annulée. */
export class EtatModifieEntreTempsError extends Error {
    constructor(
        readonly attendu: number,
        readonly modifiees: number,
    ) {
        super(
            `Écriture conditionnelle refusée : ${modifiees} ligne(s) modifiée(s) sur ${attendu} attendue(s).`,
        );
        this.name = 'EtatModifieEntreTempsError';
    }
}

/**
 * À appeler juste après un `updateMany` conditionnel, dans la transaction.
 * Lance EtatModifieEntreTempsError si le nombre de lignes modifiées n'est pas
 * celui attendu (1 par défaut ; N pour N créneaux d'un bloc).
 */
export function exigerLignesModifiees(
    resultat: { count: number },
    attendu = 1,
): void {
    if (resultat.count !== attendu) {
        throw new EtatModifieEntreTempsError(attendu, resultat.count);
    }
}

/** Vrai si l'erreur vient d'une écriture conditionnelle refusée. */
export function estEtatModifieEntreTemps(
    err: unknown,
): err is EtatModifieEntreTempsError {
    return err instanceof EtatModifieEntreTempsError;
}
