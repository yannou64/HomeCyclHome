import { Prisma } from '../../generated/prisma/client';
import { estViolationCleEtrangere } from './violation-cle-etrangere';

// Fabrique une erreur Prisma « connue » avec le code voulu, comme celles que
// lève le client quand PostgreSQL refuse une écriture.
function erreurPrisma(code: string): Prisma.PrismaClientKnownRequestError {
    return new Prisma.PrismaClientKnownRequestError('refus de la base', {
        code,
        clientVersion: 'test',
    });
}

// Brique technique du socle : pas de CAnn. La traduction en 409 est prouvée sur
// PostgreSQL réel par le CA06 de test/supprimer-compte.e2e-spec.ts.
describe('Violation de clé étrangère', () => {
    it('reconnaît une violation de clé étrangère (P2003)', () => {
        expect(estViolationCleEtrangere(erreurPrisma('P2003'))).toBe(true);
    });

    it('ne confond pas une autre erreur Prisma, comme une violation d’unicité (P2002)', () => {
        expect(estViolationCleEtrangere(erreurPrisma('P2002'))).toBe(false);
    });

    it('ne confond pas une erreur qui ne vient pas de Prisma', () => {
        expect(estViolationCleEtrangere(new Error('P2003'))).toBe(false);
        expect(estViolationCleEtrangere(undefined)).toBe(false);
    });
});
