import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../src/shared/prisma/prisma.service';
import type { UserRole } from '../../src/shared/types/user-role';

export const MOT_DE_PASSE_DE_TEST = 'MotDePasse123!';

export type UtilisateurDeTest = {
    id: string;
    email: string;
    motDePasse: string;
    role: UserRole;
};

/**
 * Crée un utilisateur actif directement en base, prêt à se connecter.
 * L'email est unique à chaque appel : plusieurs utilisateurs peuvent coexister
 * dans un même test.
 */
export async function creerUtilisateur(
    prisma: PrismaService,
    role: UserRole = 'client',
): Promise<UtilisateurDeTest> {
    const email = `${role}-${randomUUID()}@homecyclhome.test`;
    // Coût 4 (le minimum) : un hash rapide suffit pour un test
    const password_hash = await bcrypt.hash(MOT_DE_PASSE_DE_TEST, 4);
    const utilisateur = await prisma.utilisateur.create({
        data: {
            nom: 'Test',
            prenom: role,
            email,
            telephone: '0600000000',
            role,
            password_hash,
            is_actif: true,
        },
    });
    return {
        id: utilisateur.id,
        email,
        motDePasse: MOT_DE_PASSE_DE_TEST,
        role,
    };
}
