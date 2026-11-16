/**
 * Jeu de démonstration de la V2 (Refonte 2.0 → « Migration des données
 * existantes »). Lancement : `npx prisma db seed`, sur une base migrée.
 *
 * - Idempotent : vide toutes les tables avant d'insérer.
 * - Refuse de tourner en production.
 * - Aucun mot de passe dans le dépôt (public) : celui des comptes de
 *   démonstration vient de la variable d'environnement SEED_MOT_DE_PASSE.
 * - Données fictives : noms et emails en homecyclhome.test.
 */
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import {
    bornesDuJourTravail,
    jourTravail,
} from '../src/shared/domain/jour-travail';
import { PASSWORD_HASH_ROUNDS } from '../src/config/password.config';

const UN_JOUR_MS = 24 * 60 * 60 * 1000;
const DUREE_CRENEAU_MIN = 30;
const NB_JOURS_PLANIFIES = 10; // jours ouvrés planifiés à partir de demain

// ─── Garde-fous ──────────────────────────────────────────────────────────────

if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed refusé : NODE_ENV=production.');
}
const motDePasse = process.env.SEED_MOT_DE_PASSE;
if (!motDePasse) {
    throw new Error(
        'SEED_MOT_DE_PASSE absente : définir le mot de passe des comptes de démonstration dans Backend/.env.',
    );
}
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL absente.');

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
});

// ─── Dates dans le fuseau d'exploitation ─────────────────────────────────────

// Instant UTC correspondant à `minutes` après minuit, heure de Paris, le jour
// calendaire de `jour`. Passe par bornesDuJourTravail : aucun calcul en UTC.
function aMinutes(jour: Date, minutes: number): Date {
    const { debut } = bornesDuJourTravail(jour);
    return new Date(debut.getTime() + minutes * 60 * 1000);
}

// Jour de la semaine d'une date calendaire « YYYY-MM-DD » (0 = dimanche).
// La date est lue à midi UTC : le résultat ne dépend d'aucun fuseau.
function jourDeSemaine(jourCalendaire: string): number {
    return new Date(`${jourCalendaire}T12:00:00Z`).getUTCDay();
}

// Les prochains jours ouvrés (lundi à vendredi), à partir de demain à Paris.
function prochainsJoursOuvres(nombre: number): Date[] {
    const jours: Date[] = [];
    const aujourdHui = bornesDuJourTravail(new Date()).debut;
    for (let k = 1; jours.length < nombre; k++) {
        // Midi du jour k : loin de minuit, donc sans ambiguïté de fuseau
        const jour = new Date(
            aujourdHui.getTime() + k * UN_JOUR_MS + 12 * 3600 * 1000,
        );
        const js = jourDeSemaine(jourTravail(jour));
        if (js >= 1 && js <= 5) jours.push(jour);
    }
    return jours;
}

// ─── Remise à zéro ───────────────────────────────────────────────────────────

async function viderLaBase(): Promise<void> {
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
    `;
    if (tables.length === 0) return;
    const liste = tables.map((t) => `"public"."${t.tablename}"`).join(', ');
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${liste} CASCADE`);
}

// ─── Données ─────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    await viderLaBase();
    const password_hash = await bcrypt.hash(motDePasse!, PASSWORD_HASH_ROUNDS);

    // Utilisateurs (actifs, prêts à se connecter)
    const creerUtilisateur = (
        prenom: string,
        nom: string,
        role: 'admin' | 'technicien' | 'client',
    ) =>
        prisma.utilisateur.create({
            data: {
                prenom,
                nom,
                email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@homecyclhome.test`,
                telephone: '0600000000',
                role,
                password_hash,
                is_actif: true,
            },
        });
    await creerUtilisateur('Alice', 'Admin', 'admin');
    const technicienEst = await creerUtilisateur(
        'Thomas',
        'Lefort',
        'technicien',
    );
    const technicienOuest = await creerUtilisateur(
        'Sarah',
        'Morel',
        'technicien',
    );
    const technicienMixte = await creerUtilisateur(
        'Hugo',
        'Garnier',
        'technicien',
    );
    const cliente = await creerUtilisateur('Claire', 'Durand', 'client');

    // Référentiels
    const marques = await Promise.all(
        ['Btwin', 'Trek', 'Specialized', 'Giant', 'Peugeot'].map((libelle) =>
            prisma.marque.create({ data: { libelle } }),
        ),
    );
    const types = await Promise.all(
        ['VTT', 'Vélo de route', 'VTC', 'Vélo de ville', 'Vélo électrique'].map(
            (libelle) => prisma.typeCycle.create({ data: { libelle } }),
        ),
    );

    // Zones : deux rectangles approximatifs sur Lyon 3e et Lyon 5e
    const creerZone = (
        nom_zone: string,
        couleur: 'Bleu' | 'Vert',
        points: [number, number][],
    ) =>
        prisma.zone.create({
            data: {
                nom_zone,
                couleur,
                points: {
                    create: points.map(([latitude, longitude], ordre) => ({
                        latitude,
                        longitude,
                        ordre,
                    })),
                },
            },
        });
    const zoneEst = await creerZone('Lyon Est', 'Bleu', [
        [45.77, 4.84],
        [45.77, 4.88],
        [45.745, 4.88],
        [45.745, 4.84],
    ]);
    const zoneOuest = await creerZone('Lyon Ouest', 'Vert', [
        [45.775, 4.79],
        [45.775, 4.83],
        [45.745, 4.83],
        [45.745, 4.79],
    ]);

    // Affectations
    await prisma.technicienZone.createMany({
        data: [
            { technicien_id: technicienEst.id, zone_id: zoneEst.id },
            { technicien_id: technicienOuest.id, zone_id: zoneOuest.id },
            { technicien_id: technicienMixte.id, zone_id: zoneEst.id },
            { technicien_id: technicienMixte.id, zone_id: zoneOuest.id },
        ],
    });

    // Forfaits et prix actif. « Réglage des freins » dure 45 min : il n'est pas
    // multiple de 30 et occupe 2 créneaux (arrondi au multiple supérieur).
    const debutPrix = new Date(Date.now() - 30 * UN_JOUR_MS);
    const creerForfait = (
        nom: string,
        duree_minutes: number,
        montant: number,
    ) =>
        prisma.forfait.create({
            data: {
                nom,
                duree_minutes,
                description: `Forfait de démonstration : ${nom.toLowerCase()}.`,
                historique_prix: { create: { montant, date_debut: debutPrix } },
            },
            include: { historique_prix: true },
        });
    const revision = await creerForfait('Révision', 60, 59);
    await creerForfait('Réglage des freins', 45, 35);
    await creerForfait('Réparation de crevaison', 30, 25);
    await creerForfait('Entretien complet', 120, 119);

    // Modèles de planification : une semaine type, matin et après-midi
    const BLOCS = [
        { debut: 8 * 60, fin: 12 * 60 }, // 8h00–12h00
        { debut: 13 * 60 + 30, fin: 17 * 60 + 30 }, // 13h30–17h30
    ];
    const affectationsPlanifiees = [
        { technicien: technicienEst, zone: zoneEst },
        { technicien: technicienOuest, zone: zoneOuest },
    ];
    for (const { technicien, zone } of affectationsPlanifiees) {
        await prisma.modelePlanification.create({
            data: {
                intitule: `Semaine type — ${zone.nom_zone}`,
                lundi: true,
                mardi: true,
                mercredi: true,
                jeudi: true,
                vendredi: true,
                technicien_id: technicien.id,
                zone_id: zone.id,
                blocs: { create: BLOCS },
            },
        });
    }

    // Créneaux Libres sur les prochains jours ouvrés, selon les blocs
    const jours = prochainsJoursOuvres(NB_JOURS_PLANIFIES);
    for (const { technicien, zone } of affectationsPlanifiees) {
        const data = jours.flatMap((jour) =>
            BLOCS.flatMap(({ debut, fin }) => {
                const creneaux: {
                    date_debut: Date;
                    technicien_id: string;
                    zone_id: string;
                }[] = [];
                for (let m = debut; m < fin; m += DUREE_CRENEAU_MIN) {
                    creneaux.push({
                        date_debut: aMinutes(jour, m),
                        technicien_id: technicien.id,
                        zone_id: zone.id,
                    });
                }
                return creneaux;
            }),
        );
        await prisma.creneau.createMany({ data });
    }

    // La cliente : une adresse principale dans Lyon Est et un vélo
    const adresse = await prisma.adresse.create({
        data: {
            numero: '3',
            rue: 'Rue de la Viabert',
            code_postal: '69003',
            ville: 'Lyon',
            latitude: 45.7605,
            longitude: 4.8615,
            google_place_id: 'seed-adresse-lyon-est',
        },
    });
    await prisma.peutSeSituer.create({
        data: {
            utilisateur_id: cliente.id,
            adresse_id: adresse.id,
            titre_description: 'Domicile',
            adresse_principal: true,
        },
    });
    const velo = await prisma.cycle.create({
        data: {
            libelle: 'Mon vélo de ville',
            utilisateur_id: cliente.id,
            marque_id: marques[0].id,
            type_cycle_id: types[3].id,
        },
    });

    // Une intervention Planifiée, avec son bloc complet le premier jour planifié :
    // Déplacement 9h00, intervention 9h30–10h30 (Révision : 2 créneaux),
    // Déplacement 10h30.
    const premierJour = jours[0];
    const intervention = await prisma.intervention.create({
        data: {
            client_id: cliente.id,
            technicien_id: technicienEst.id,
            cycle_id: velo.id,
            adresse_id: adresse.id,
            historique_prix_forfait_id: revision.historique_prix[0].id,
            duree_minutes_snapshot: revision.duree_minutes,
            date_prevue: aMinutes(premierJour, 9 * 60 + 30),
            commentaire_client: 'Le vélo est dans le local au rez-de-chaussée.',
        },
    });
    const statutDuBloc: [number, 'Deplacement' | 'InterventionReservee'][] = [
        [9 * 60, 'Deplacement'],
        [9 * 60 + 30, 'InterventionReservee'],
        [10 * 60, 'InterventionReservee'],
        [10 * 60 + 30, 'Deplacement'],
    ];
    for (const [minutes, statut] of statutDuBloc) {
        await prisma.creneau.update({
            where: {
                technicien_id_date_debut: {
                    technicien_id: technicienEst.id,
                    date_debut: aMinutes(premierJour, minutes),
                },
            },
            data: {
                statut,
                // Seul un créneau « Intervention réservée » porte l'intervention
                intervention_id:
                    statut === 'InterventionReservee' ? intervention.id : null,
            },
        });
    }

    const nbCreneaux = await prisma.creneau.count();
    console.log(
        `Seed terminé : 5 comptes (mot de passe : SEED_MOT_DE_PASSE), 2 zones, 4 forfaits, ${nbCreneaux} créneaux, 1 intervention planifiée.`,
    );
}

main()
    .catch((err: unknown) => {
        console.error(err);
        process.exitCode = 1;
    })
    .finally(() => {
        void prisma.$disconnect();
    });
