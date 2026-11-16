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

/**
 * Crée une intervention Planifiée minimale, avec tout ce qu'elle exige :
 * client, technicien, cycle (marque, type), adresse, forfait et prix actif.
 * Renvoie son id et ceux de ses dépendances, pour préparer et vérifier.
 */
export async function creerIntervention(prisma: PrismaService): Promise<{
    id: string;
    clientId: string;
    technicienId: string;
}> {
    const suffixe = randomUUID();
    const client = await creerUtilisateur(prisma, 'client');
    const technicien = await creerUtilisateur(prisma, 'technicien');
    const marque = await prisma.marque.create({
        data: { libelle: `Marque ${suffixe}` },
    });
    const type = await prisma.typeCycle.create({
        data: { libelle: `Type ${suffixe}` },
    });
    const cycle = await prisma.cycle.create({
        data: {
            libelle: 'Vélo de test',
            utilisateur_id: client.id,
            marque_id: marque.id,
            type_cycle_id: type.id,
        },
    });
    const adresse = await prisma.adresse.create({
        data: {
            rue: 'Rue de test',
            code_postal: '69003',
            ville: 'Lyon',
            latitude: 45.7578,
            longitude: 4.8487,
            google_place_id: `test-${suffixe}`,
        },
    });
    const forfait = await prisma.forfait.create({
        data: {
            nom: `Forfait ${suffixe}`,
            duree_minutes: 60,
            historique_prix: {
                create: { montant: 59, date_debut: new Date() },
            },
        },
        include: { historique_prix: true },
    });
    const intervention = await prisma.intervention.create({
        data: {
            client_id: client.id,
            technicien_id: technicien.id,
            cycle_id: cycle.id,
            adresse_id: adresse.id,
            historique_prix_forfait_id: forfait.historique_prix[0].id,
            duree_minutes_snapshot: 60,
            date_prevue: new Date('2026-06-01T07:30:00.000Z'),
        },
    });
    return {
        id: intervention.id,
        clientId: client.id,
        technicienId: technicien.id,
    };
}
