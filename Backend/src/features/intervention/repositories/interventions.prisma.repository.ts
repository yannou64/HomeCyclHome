import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import type {
    IInterventionsRepository,
    GetAdminInterventionsParams,
} from './interventions.repository.interface';
import type { InterventionListItemResponseDto } from '../dto/output/intervention-list-item-response.dto';
import type { AdminInterventionListItemResponseDto } from '../dto/output/admin-intervention-list-item-response.dto';
import type { AdminInterventionDetailResponseDto } from '../dto/output/admin-intervention-detail-response.dto';

// Fin prévue d'une intervention : sa date de début plus sa durée figée.
function finPrevue(datePrevue: Date, dureeMinutes: number): string {
    return new Date(
        datePrevue.getTime() + dureeMinutes * 60 * 1000,
    ).toISOString();
}

// Zone d'une intervention, lue sur son premier créneau (le schéma V2 ne la
// fige pas sur l'intervention). Null quand ses créneaux ont été supprimés.
const ZONE_DU_PREMIER_CRENEAU = {
    select: { zone: { select: { id: true, nom_zone: true } } },
    orderBy: { date_debut: 'asc' },
    take: 1,
} satisfies Prisma.Intervention$creneauxArgs;

function zoneDe(creneaux: { zone: { id: string; nom_zone: string } }[]) {
    const zone = creneaux[0]?.zone;
    return zone ? { id: zone.id, nom: zone.nom_zone } : null;
}

@Injectable()
export class InterventionsPrismaRepository implements IInterventionsRepository {
    constructor(private readonly prisma: PrismaService) {}

    async getInterventionsByClientId(
        clientId: string,
    ): Promise<InterventionListItemResponseDto[]> {
        const interventions = await this.prisma.intervention.findMany({
            where: { client_id: clientId },
            orderBy: { date_creation: 'desc' },
            select: {
                id: true,
                statut: true,
                date_creation: true,
                date_prevue: true,
                duree_minutes_snapshot: true,
                commentaire_client: true,
                historique_prix: {
                    select: { forfait: { select: { nom: true } } },
                },
                adresse: {
                    select: {
                        numero: true,
                        rue: true,
                        code_postal: true,
                        ville: true,
                    },
                },
                cycle: {
                    select: {
                        libelle: true,
                        marque: { select: { libelle: true } },
                        type_cycle: { select: { libelle: true } },
                    },
                },
            },
        });

        return interventions.map((i) => ({
            id: i.id,
            statut: i.statut,
            dateCreation: i.date_creation.toISOString(),
            dateDebut: i.date_prevue.toISOString(),
            dateFin: finPrevue(i.date_prevue, i.duree_minutes_snapshot),
            forfaitNom: i.historique_prix.forfait.nom,
            dureeMinutesSnapshot: i.duree_minutes_snapshot,
            adresse: {
                numero: i.adresse.numero,
                rue: i.adresse.rue,
                codePostal: i.adresse.code_postal,
                ville: i.adresse.ville,
            },
            cycle: {
                libelle: i.cycle.libelle,
                marque: i.cycle.marque.libelle,
                type: i.cycle.type_cycle.libelle,
            },
            commentaire: i.commentaire_client,
        }));
    }

    async findAllInterventions(params: GetAdminInterventionsParams): Promise<{
        interventions: AdminInterventionListItemResponseDto[];
        total: number;
    }> {
        const { statut, zoneId, technicienId, page, limit } = params;
        const now = new Date();

        const where: Prisma.InterventionWhereInput = {
            ...(statut === 'archivees'
                ? { statut: { in: ['Realisee', 'Annulee'] } }
                : statut
                  ? { statut: 'Planifiee' }
                  : {}),
            ...(statut === 'enRetard'
                ? { date_prevue: { lt: now } }
                : statut === 'Planifiee'
                  ? { date_prevue: { gte: now } }
                  : {}),
            ...(zoneId ? { creneaux: { some: { zone_id: zoneId } } } : {}),
            ...(technicienId ? { technicien_id: technicienId } : {}),
        };

        const [interventions, total] = await this.prisma.$transaction([
            this.prisma.intervention.findMany({
                where,
                select: {
                    id: true,
                    statut: true,
                    date_prevue: true,
                    technicien: {
                        select: { id: true, prenom: true, nom: true },
                    },
                    historique_prix: {
                        select: { forfait: { select: { nom: true } } },
                    },
                    creneaux: ZONE_DU_PREMIER_CRENEAU,
                },
                orderBy: { date_prevue: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.intervention.count({ where }),
        ]);

        return {
            interventions: interventions.map((i) => ({
                id: i.id,
                statut: i.statut,
                enRetard: i.statut === 'Planifiee' && i.date_prevue < now,
                dateDebut: i.date_prevue.toISOString(),
                forfaitNom: i.historique_prix.forfait.nom,
                zone: zoneDe(i.creneaux),
                technicien: i.technicien,
            })),
            total,
        };
    }

    async isInterventionOwnedByClient(
        interventionId: string,
        clientId: string,
    ): Promise<boolean> {
        const count = await this.prisma.intervention.count({
            where: { id: interventionId, client_id: clientId },
        });
        return count > 0;
    }

    async getPhotosCount(interventionId: string): Promise<number> {
        return this.prisma.photo.count({
            where: { intervention_id: interventionId },
        });
    }

    async createPhotos(
        interventionId: string,
        photos: { urlS3: string; cleS3: string }[],
        contexte: 'client' | 'technicien',
    ): Promise<void> {
        await this.prisma.photo.createMany({
            data: photos.map((p) => ({
                url_s3: p.urlS3,
                cle_s3: p.cleS3,
                contexte,
                intervention_id: interventionId,
            })),
        });
    }

    async findInterventionDetailById(
        id: string,
    ): Promise<AdminInterventionDetailResponseDto | null> {
        const intervention = await this.prisma.intervention.findUnique({
            where: { id },
            select: {
                id: true,
                statut: true,
                date_creation: true,
                date_prevue: true,
                duree_minutes_snapshot: true,
                commentaire_client: true,
                technicien: { select: { id: true, prenom: true, nom: true } },
                historique_prix: {
                    select: { forfait: { select: { nom: true } } },
                },
                creneaux: ZONE_DU_PREMIER_CRENEAU,
                client: {
                    select: {
                        id: true,
                        prenom: true,
                        nom: true,
                        email: true,
                        telephone: true,
                    },
                },
                adresse: {
                    select: {
                        numero: true,
                        rue: true,
                        code_postal: true,
                        ville: true,
                    },
                },
                cycle: {
                    select: {
                        libelle: true,
                        marque: { select: { libelle: true } },
                        type_cycle: { select: { libelle: true } },
                    },
                },
                photos: {
                    select: { id: true, url_s3: true, contexte: true },
                    orderBy: { date_creation: 'asc' },
                },
            },
        });

        if (!intervention) return null;

        return {
            id: intervention.id,
            statut: intervention.statut,
            enRetard:
                intervention.statut === 'Planifiee' &&
                intervention.date_prevue < new Date(),
            dateDebut: intervention.date_prevue.toISOString(),
            forfaitNom: intervention.historique_prix.forfait.nom,
            zone: zoneDe(intervention.creneaux),
            technicien: intervention.technicien,
            dateCreation: intervention.date_creation.toISOString(),
            dateFin: finPrevue(
                intervention.date_prevue,
                intervention.duree_minutes_snapshot,
            ),
            dureeMinutesSnapshot: intervention.duree_minutes_snapshot,
            commentaire: intervention.commentaire_client,
            client: {
                id: intervention.client.id,
                prenom: intervention.client.prenom,
                nom: intervention.client.nom,
                email: intervention.client.email,
                telephone: intervention.client.telephone,
            },
            adresse: {
                numero: intervention.adresse.numero,
                rue: intervention.adresse.rue,
                codePostal: intervention.adresse.code_postal,
                ville: intervention.adresse.ville,
            },
            cycle: {
                libelle: intervention.cycle.libelle,
                marque: intervention.cycle.marque.libelle,
                type: intervention.cycle.type_cycle.libelle,
            },
            photosClient: intervention.photos
                .filter((p) => p.contexte === 'client')
                .map((p) => ({ id: p.id, urlS3: p.url_s3 })),
            photosTechnicien: intervention.photos
                .filter((p) => p.contexte === 'technicien')
                .map((p) => ({ id: p.id, urlS3: p.url_s3 })),
        };
    }
}
