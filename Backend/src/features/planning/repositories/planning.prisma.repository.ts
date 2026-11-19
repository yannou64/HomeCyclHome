import { Injectable } from '@nestjs/common';
import type {
    BlocHoraire,
    ModelePlanification,
} from '../../../generated/prisma/client';
import {
    estEtatModifieEntreTemps,
    exigerLignesModifiees,
} from '../../../shared/database/ecriture-conditionnelle';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { JOURS_SEMAINE, type JourSemaine } from '../dto/jours-semaine';
import { ModelePlanificationResponseDto } from '../dto/output/modele-planification-response.dto';
import { ZoneProposeeResponseDto } from '../dto/output/zone-proposee-response.dto';
import {
    CreateModeleData,
    IPlanningRepository,
    ModeleAvecZone,
    ModeleDetail,
    ModifierModeleData,
} from './planning.repository.interface';

type ModeleAvecBlocs = ModelePlanification & { blocs: BlocHoraire[] };

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
