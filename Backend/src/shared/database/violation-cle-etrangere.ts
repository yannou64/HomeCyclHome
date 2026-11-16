import { Prisma } from '../../generated/prisma/client';

/**
 * Violation de clé étrangère — brique partagée (Backend/CLAUDE.md, « Erreurs de
 * base de données »).
 *
 * Quand PostgreSQL refuse une écriture à cause d'une clé étrangère (par exemple
 * supprimer un utilisateur encore référencé par une intervention, relation
 * RESTRICT), Prisma lève une PrismaClientKnownRequestError de code « P2003 ».
 * Non interceptée, elle finit en erreur 500 brute.
 *
 * Cette fonction répond à une seule question, dans le `catch` d'un repository :
 * « l'erreur reçue est-elle une violation de clé étrangère ? »
 *   - oui → le repository renvoie l'information, le use case la traduit en
 *     exception métier avec le message de la spec (ConflictException) ;
 *   - non → c'est une autre panne : le repository relance l'erreur telle quelle.
 *
 * Usage, dans une méthode de repository :
 *   try {
 *       await this.prisma.utilisateur.delete({ where: { id } });
 *       return { supprime: true };
 *   } catch (err) {
 *       if (estViolationCleEtrangere(err)) return { supprime: false };
 *       throw err;
 *   }
 *
 * Elle filet le cas rare où la donnée liée est créée entre le contrôle du use
 * case et l'écriture : le contrôle applicatif reste le chemin normal.
 */
export function estViolationCleEtrangere(err: unknown): boolean {
    return (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003' // code Prisma : « Foreign key constraint failed »
    );
}
