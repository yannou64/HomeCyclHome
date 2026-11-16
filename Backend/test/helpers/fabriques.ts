import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../src/shared/prisma/prisma.service';
import type { UserRole } from '../../src/shared/types/user-role';
import type { StatutIntervention } from '../../src/generated/prisma/enums';

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
 * Crée un cycle (avec sa marque et son type) appartenant à l'utilisateur donné.
 */
export async function creerCycle(
    prisma: PrismaService,
    utilisateurId: string,
): Promise<{ id: string }> {
    const suffixe = randomUUID();
    const marque = await prisma.marque.create({
        data: { libelle: `Marque ${suffixe}` },
    });
    const type = await prisma.typeCycle.create({
        data: { libelle: `Type ${suffixe}` },
    });
    return prisma.cycle.create({
        data: {
            libelle: 'Vélo de test',
            utilisateur_id: utilisateurId,
            marque_id: marque.id,
            type_cycle_id: type.id,
        },
        select: { id: true },
    });
}

/**
 * Crée une adresse et la relie à l'utilisateur par la table de liaison
 * PeutSeSituer (une adresse est partagée : elle n'appartient pas à un seul
 * utilisateur, c'est le lien qui lui appartient).
 * Renvoie l'id de l'adresse et celui du lien.
 */
export async function creerAdresseDe(
    prisma: PrismaService,
    utilisateurId: string,
): Promise<{ adresseId: string; lienId: string }> {
    const adresse = await prisma.adresse.create({
        data: {
            rue: 'Rue de test',
            code_postal: '69003',
            ville: 'Lyon',
            latitude: 45.7578,
            longitude: 4.8487,
            google_place_id: `test-${randomUUID()}`,
        },
    });
    const lien = await prisma.peutSeSituer.create({
        data: {
            utilisateur_id: utilisateurId,
            adresse_id: adresse.id,
            adresse_principal: true,
        },
    });
    return { adresseId: adresse.id, lienId: lien.id };
}

/** Options de creerIntervention : tout est facultatif. */
export type OptionsIntervention = {
    statut?: StatutIntervention; // Planifiee par défaut
    clientId?: string; // un client existant ; sinon un nouveau est créé
    technicienId?: string; // un technicien existant ; sinon un nouveau est créé
};

/**
 * Crée une intervention minimale, avec tout ce qu'elle exige :
 * client, technicien, cycle (marque, type), adresse liée au client, forfait et
 * prix actif. Renvoie son id et ceux de ses dépendances, pour préparer et vérifier.
 */
export async function creerIntervention(
    prisma: PrismaService,
    options: OptionsIntervention = {},
): Promise<{
    id: string;
    clientId: string;
    technicienId: string;
    cycleId: string;
    adresseId: string;
}> {
    const suffixe = randomUUID();
    const clientId =
        options.clientId ?? (await creerUtilisateur(prisma, 'client')).id;
    const technicienId =
        options.technicienId ??
        (await creerUtilisateur(prisma, 'technicien')).id;
    const cycle = await creerCycle(prisma, clientId);
    const { adresseId } = await creerAdresseDe(prisma, clientId);
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
            client_id: clientId,
            technicien_id: technicienId,
            cycle_id: cycle.id,
            adresse_id: adresseId,
            historique_prix_forfait_id: forfait.historique_prix[0].id,
            duree_minutes_snapshot: 60,
            date_prevue: new Date('2026-06-01T07:30:00.000Z'),
            statut: options.statut ?? 'Planifiee',
        },
    });
    return {
        id: intervention.id,
        clientId,
        technicienId,
        cycleId: cycle.id,
        adresseId,
    };
}
