import { Injectable } from '@nestjs/common';
import {
    Prisma,
    type BlocHoraire,
    type ModelePlanification,
} from '../../../generated/prisma/client';
import { ajouterAuCommentaire } from '../../../shared/database/commentaire-partage';
import {
    estEtatModifieEntreTemps,
    exigerLignesModifiees,
} from '../../../shared/database/ecriture-conditionnelle';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { JOURS_SEMAINE, type JourSemaine } from '../dto/jours-semaine';
import { ModelePlanificationResponseDto } from '../dto/output/modele-planification-response.dto';
import { ZoneProposeeResponseDto } from '../dto/output/zone-proposee-response.dto';
import {
    ComptagePeriode,
    CreateModeleData,
    CreneauAvecZone,
    DerniersCreneaux,
    IPlanningRepository,
    ModeleAvecZone,
    ModeleDetail,
    ModifierModeleData,
    RemplacementCreneaux,
    ResultatRemplacement,
    TechnicienResume,
    ZoneResume,
} from './planning.repository.interface';

type ModeleAvecBlocs = ModelePlanification & { blocs: BlocHoraire[] };

/**
 * Vrai si PostgreSQL a refusé une écriture pour cause d'unicité (code Prisma
 * P2002). Locale à ce repository tant qu'elle n'a pas d'autre usage.
 */
function estViolationUnicite(err: unknown): boolean {
    return (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
    );
}

@Injectable()
export class PlanningPrismaRepository implements IPlanningRepository {
    constructor(private readonly prisma: PrismaService) {}

    async technicienExiste(technicienId: string): Promise<boolean> {
        const n = await this.prisma.utilisateur.count({
            where: { id: technicienId, role: 'technicien' },
        });
        return n > 0;
    }

    async trouverZonesProposees(
        technicienId: string,
    ): Promise<ZoneProposeeResponseDto[]> {
        const zones = await this.prisma.zone.findMany({
            where: {
                is_active: true,
                techniciens_affectes: { some: { technicien_id: technicienId } },
            },
            orderBy: { nom_zone: 'asc' },
        });
        return zones.map((z) => ({
            id: z.id,
            nomZone: z.nom_zone,
            couleur: z.couleur,
        }));
    }

    async zoneAffecteeEtActive(
        technicienId: string,
        zoneId: string,
    ): Promise<boolean> {
        const n = await this.prisma.technicienZone.count({
            where: {
                technicien_id: technicienId,
                zone_id: zoneId,
                zone: { is_active: true },
            },
        });
        return n > 0;
    }

    async intituleExiste(
        technicienId: string,
        intitule: string,
        saufModeleId?: string,
    ): Promise<boolean> {
        const n = await this.prisma.modelePlanification.count({
            where: {
                technicien_id: technicienId,
                // « matin » = « Matin » : comparaison sans tenir compte de la casse
                intitule: { equals: intitule, mode: 'insensitive' },
                // En modification, le modèle ne se compare pas à lui-même
                ...(saufModeleId && { id: { not: saufModeleId } }),
            },
        });
        return n > 0;
    }

    async trouverModeles(technicienId: string): Promise<ModeleAvecZone[]> {
        const modeles = await this.prisma.modelePlanification.findMany({
            where: { technicien_id: technicienId },
            orderBy: { intitule: 'asc' },
            include: {
                zone: {
                    include: {
                        // Affectation de CE technicien à la zone, s'il y en a une
                        techniciens_affectes: {
                            where: { technicien_id: technicienId },
                            select: { technicien_id: true },
                        },
                    },
                },
            },
        });
        return modeles.map((m) => ({
            id: m.id,
            intitule: m.intitule,
            zone: {
                id: m.zone.id,
                nomZone: m.zone.nom_zone,
                couleur: m.zone.couleur,
                isActive: m.zone.is_active,
            },
            zoneAffectee: m.zone.techniciens_affectes.length > 0,
        }));
    }

    async creerModele(
        data: CreateModeleData,
    ): Promise<ModelePlanificationResponseDto> {
        // Tout ou rien (séquence, étapes 16 à 18) : si l'écriture d'un bloc
        // échoue, PostgreSQL annule aussi le modèle déjà écrit
        const modele = await this.prisma.$transaction(async (tx) => {
            const cree = await tx.modelePlanification.create({
                data: {
                    intitule: data.intitule,
                    technicien_id: data.technicienId,
                    zone_id: data.zoneId,
                    ...this.colonnesJours(data.jours),
                },
            });
            await tx.blocHoraire.createMany({
                data: data.blocs.map((b) => ({
                    debut: b.debut,
                    fin: b.fin,
                    modele_planification_id: cree.id,
                })),
            });
            return tx.modelePlanification.findUniqueOrThrow({
                where: { id: cree.id },
                include: { blocs: { orderBy: { debut: 'asc' } } },
            });
        });
        return this.toDto(modele);
    }

    async trouverModele(
        technicienId: string,
        modeleId: string,
    ): Promise<ModeleDetail | null> {
        // Filtré sur le technicien : le modèle d'un autre est « introuvable »
        const modele = await this.prisma.modelePlanification.findFirst({
            where: { id: modeleId, technicien_id: technicienId },
            include: {
                blocs: { orderBy: { debut: 'asc' } },
                zone: {
                    include: {
                        // Affectation de CE technicien à la zone, s'il y en a une
                        techniciens_affectes: {
                            where: { technicien_id: technicienId },
                            select: { technicien_id: true },
                        },
                    },
                },
            },
        });
        if (!modele) return null;
        return {
            ...this.toDto(modele),
            zoneActive: modele.zone.is_active,
            zoneAffectee: modele.zone.techniciens_affectes.length > 0,
        };
    }

    async modifierModele(
        technicienId: string,
        modeleId: string,
        data: ModifierModeleData,
    ): Promise<ModelePlanificationResponseDto | null> {
        try {
            // Tout ou rien (séquence, étapes 17 à 19) : si l'écriture d'un
            // bloc échoue, la mise à jour du modèle et la suppression des
            // anciens blocs sont annulées aussi
            const modele = await this.prisma.$transaction(async (tx) => {
                // Écriture conditionnelle : seulement si le modèle existe
                // encore pour ce technicien (un autre onglet a pu le supprimer
                // depuis la lecture du use case)
                const r = await tx.modelePlanification.updateMany({
                    where: { id: modeleId, technicien_id: technicienId },
                    data: {
                        intitule: data.intitule,
                        zone_id: data.zoneId,
                        ...this.colonnesJours(data.jours),
                    },
                });
                exigerLignesModifiees(r);

                // Les blocs sont remplacés en entier, pas retouchés un par un
                await tx.blocHoraire.deleteMany({
                    where: { modele_planification_id: modeleId },
                });
                await tx.blocHoraire.createMany({
                    data: data.blocs.map((b) => ({
                        debut: b.debut,
                        fin: b.fin,
                        modele_planification_id: modeleId,
                    })),
                });
                return tx.modelePlanification.findUniqueOrThrow({
                    where: { id: modeleId },
                    include: { blocs: { orderBy: { debut: 'asc' } } },
                });
            });
            return this.toDto(modele);
        } catch (err) {
            // Modèle disparu entre-temps : le use case répondra « introuvable »
            if (estEtatModifieEntreTemps(err)) return null;
            throw err;
        }
    }

    async compterPeriode(
        technicienId: string,
        debut: Date,
        fin: Date,
    ): Promise<ComptagePeriode> {
        const where = {
            technicien_id: technicienId,
            date_debut: { gte: debut, lt: fin },
        };
        const [creneaux, lies] = await Promise.all([
            this.prisma.creneau.count({ where }),
            // Interventions distinctes : seuls les créneaux réservés portent
            // le lien, plusieurs par intervention (son bloc)
            this.prisma.creneau.findMany({
                where: { ...where, intervention_id: { not: null } },
                distinct: ['intervention_id'],
                select: { intervention_id: true },
            }),
        ]);
        return { creneaux, interventions: lies.length };
    }

    async remplacerCreneaux(
        data: RemplacementCreneaux,
    ): Promise<ResultatRemplacement | null> {
        const periode = {
            technicien_id: data.technicienId,
            date_debut: { gte: data.debut, lt: data.fin },
        };
        try {
            // Tout ou rien (séquence de l'US-03, étapes 10 à 15)
            return await this.prisma.$transaction(async (tx) => {
                // 0. Verrouiller les créneaux de la période : une réservation
                //    simultanée (qui modifie un créneau Libre) attend la fin
                //    de cette transaction, puis ne trouve plus son créneau.
                //    Sans verrou, une intervention réservée entre l'étape 1
                //    et l'étape 3 perdrait ses créneaux sans passer en conflit.
                const verrouilles = await tx.$queryRaw<
                    { intervention_id: string | null }[]
                >`
                    SELECT intervention_id FROM "Creneaux"
                    WHERE technicien_id = ${data.technicienId}
                      AND date_debut >= ${data.debut}
                      AND date_debut < ${data.fin}
                    FOR UPDATE
                `;
                const touchees = [
                    ...new Set(
                        verrouilles
                            .map((c) => c.intervention_id)
                            .filter((id): id is string => id !== null),
                    ),
                ];

                // 1. Les Planifiées touchées passent en conflit (RG11) ; une
                //    Réalisée ou une En conflit garde son statut. Écriture
                //    conditionnelle : si un statut a changé entre la lecture
                //    et l'écriture, tout est annulé.
                const planifiees = await tx.intervention.findMany({
                    where: { id: { in: touchees }, statut: 'Planifiee' },
                    select: { id: true },
                });
                const ids = planifiees.map((i) => i.id);
                const r = await tx.intervention.updateMany({
                    where: { id: { in: ids }, statut: 'Planifiee' },
                    data: { statut: 'EnConflit' },
                });
                exigerLignesModifiees(r, ids.length);

                // 2. L'origine du conflit, en tête du commentaire partagé de
                //    chaque intervention passée en conflit (RG16)
                for (const id of ids) {
                    await ajouterAuCommentaire(tx, id, data.entreeConflit);
                }

                // 3. Tous les créneaux de la période, quel que soit leur
                //    statut ou leur jour de semaine (RG9) : les blocs réservés
                //    y sont en entier, déplacements compris
                const supprimes = await tx.creneau.deleteMany({
                    where: periode,
                });

                // 4. Les nouveaux créneaux Libres, sans lien vers un modèle
                //    (RG12). L'unicité (technicien, horaire) est garantie par
                //    la base.
                await tx.creneau.createMany({
                    data: data.nouveaux.map((dateDebut) => ({
                        technicien_id: data.technicienId,
                        zone_id: data.zoneId,
                        date_debut: dateDebut,
                        statut: 'Libre' as const,
                    })),
                });

                return {
                    creneauxSupprimes: supprimes.count,
                    interventionsEnConflit: ids.length,
                };
            });
        } catch (err) {
            // Statut modifié entre-temps, ou créneau créé au même horaire par
            // une autre génération simultanée : transaction annulée, le use
            // case répond par un conflit
            if (estEtatModifieEntreTemps(err) || estViolationUnicite(err)) {
                return null;
            }
            throw err;
        }
    }

    async supprimerModele(
        technicienId: string,
        modeleId: string,
    ): Promise<boolean> {
        try {
            // Tout ou rien (séquence, étapes 8 à 10) : blocs puis modèle
            await this.prisma.$transaction(async (tx) => {
                // Filtre sur le modèle seul : si la suppression du modèle
                // échoue ensuite, celle des blocs est annulée avec elle (CA11)
                await tx.blocHoraire.deleteMany({
                    where: { modele_planification_id: modeleId },
                });
                // Écriture conditionnelle : le modèle doit exister pour ce
                // technicien. 0 ligne = inexistant, d'un autre technicien, ou
                // déjà supprimé par un autre onglet (CA02, CA10)
                const r = await tx.modelePlanification.deleteMany({
                    where: { id: modeleId, technicien_id: technicienId },
                });
                exigerLignesModifiees(r);
            });
            return true;
        } catch (err) {
            if (estEtatModifieEntreTemps(err)) return false;
            throw err;
        }
    }

    async trouverCreneauxEntre(
        debut: Date,
        fin: Date,
    ): Promise<CreneauAvecZone[]> {
        // Bornes déjà calculées en heure de Paris par le use case : ici, une
        // simple plage d'instants UTC, [debut, fin[
        const creneaux = await this.prisma.creneau.findMany({
            where: { date_debut: { gte: debut, lt: fin } },
            orderBy: { date_debut: 'asc' },
            select: {
                date_debut: true,
                statut: true,
                technicien_id: true,
                zone: {
                    select: {
                        id: true,
                        nom_zone: true,
                        couleur: true,
                        is_active: true,
                    },
                },
            },
        });
        return creneaux.map((c) => ({
            dateDebut: c.date_debut,
            statut: c.statut,
            technicienId: c.technicien_id,
            zone: {
                id: c.zone.id,
                nomZone: c.zone.nom_zone,
                couleur: c.zone.couleur,
                isActive: c.zone.is_active,
            },
        }));
    }

    async trouverTechniciens(): Promise<TechnicienResume[]> {
        const techniciens = await this.prisma.utilisateur.findMany({
            where: { role: 'technicien' },
            orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
            select: { id: true, prenom: true, nom: true, is_actif: true },
        });
        return techniciens.map((u) => ({
            id: u.id,
            prenom: u.prenom,
            nom: u.nom,
            isActif: u.is_actif,
        }));
    }

    async trouverZones(): Promise<ZoneResume[]> {
        const zones = await this.prisma.zone.findMany({
            orderBy: { nom_zone: 'asc' },
            select: {
                id: true,
                nom_zone: true,
                couleur: true,
                is_active: true,
            },
        });
        return zones.map((z) => ({
            id: z.id,
            nomZone: z.nom_zone,
            couleur: z.couleur,
            isActive: z.is_active,
        }));
    }

    async derniersCreneaux(): Promise<DerniersCreneaux> {
        // Deux agrégats en base (MAX par groupe) plutôt que lire tous les
        // créneaux : une ligne par technicien, une ligne par zone
        const [parTechnicien, parZone] = await Promise.all([
            this.prisma.creneau.groupBy({
                by: ['technicien_id'],
                _max: { date_debut: true },
            }),
            this.prisma.creneau.groupBy({
                by: ['zone_id'],
                _max: { date_debut: true },
            }),
        ]);
        const versMap = <K extends string>(
            lignes: ({ _max: { date_debut: Date | null } } & Record<
                K,
                string
            >)[],
            cle: K,
        ) =>
            new Map(
                lignes
                    .filter((l) => l._max.date_debut !== null)
                    .map((l) => [l[cle], l._max.date_debut as Date]),
            );
        return {
            parTechnicien: versMap(parTechnicien, 'technicien_id'),
            parZone: versMap(parZone, 'zone_id'),
        };
    }

    /** Liste de jours → sept booléens (lundi: true, mardi: false…). */
    private colonnesJours(jours: JourSemaine[]): Record<JourSemaine, boolean> {
        return Object.fromEntries(
            JOURS_SEMAINE.map((j) => [j, jours.includes(j)]),
        ) as Record<JourSemaine, boolean>;
    }

    // Jamais le modèle Prisma brut en réponse
    private toDto(modele: ModeleAvecBlocs): ModelePlanificationResponseDto {
        const jours: JourSemaine[] = JOURS_SEMAINE.filter((j) => modele[j]);
        return {
            id: modele.id,
            intitule: modele.intitule,
            technicienId: modele.technicien_id,
            zoneId: modele.zone_id,
            jours,
            blocs: modele.blocs.map((b) => ({ debut: b.debut, fin: b.fin })),
        };
    }
}
