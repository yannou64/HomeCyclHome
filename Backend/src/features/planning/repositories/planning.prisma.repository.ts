import { Injectable } from '@nestjs/common';
import type {
    BlocHoraire,
    ModelePlanification,
} from '../../../generated/prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { JOURS_SEMAINE, type JourSemaine } from '../dto/jours-semaine';
import { ModelePlanificationResponseDto } from '../dto/output/modele-planification-response.dto';
import { ZoneProposeeResponseDto } from '../dto/output/zone-proposee-response.dto';
import {
    CreateModeleData,
    IPlanningRepository,
    ModeleAvecZone,
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
    ): Promise<boolean> {
        const n = await this.prisma.modelePlanification.count({
            where: {
                technicien_id: technicienId,
                // « matin » = « Matin » : comparaison sans tenir compte de la casse
                intitule: { equals: intitule, mode: 'insensitive' },
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
                    // Liste de jours → sept booléens (lundi: true, mardi: false…)
                    ...Object.fromEntries(
                        JOURS_SEMAINE.map((j) => [j, data.jours.includes(j)]),
                    ),
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
