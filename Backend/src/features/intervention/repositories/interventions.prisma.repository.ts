import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import type {
    IInterventionsRepository,
    UpsertAdresseInput,
    CreateCycleInput,
    CreateInterventionData,
    PrixForfait,
    ClientInfo,
    InterventionForCancel,
    GetAdminInterventionsParams,
} from './interventions.repository.interface';
import type { InterventionCreatedDto } from '../dto/output/intervention-created.dto';
import type { InterventionListItemDto } from '../dto/output/intervention-list-item.dto';
import type { AdminInterventionListItemDto } from '../dto/output/admin-intervention-list-item.dto';
import type { AdminInterventionDetailDto } from '../dto/output/admin-intervention-detail.dto';

@Injectable()
export class InterventionsPrismaRepository implements IInterventionsRepository {
    constructor(private readonly prisma: PrismaService) {}

    async isCreneauDisponible(creneauId: string): Promise<boolean> {
        const creneau = await this.prisma.creneau.findUnique({
            where: { id: creneauId },
            select: { is_disponible: true },
        });
        return creneau?.is_disponible ?? false;
    }

    async createCycle(
        utilisateurId: string,
        data: CreateCycleInput,
    ): Promise<string> {
        const cycle = await this.prisma.cycle.create({
            data: {
                libelle: 'Mon vélo',
                utilisateur_id: utilisateurId,
                type_cycle_id: data.typeCycleId,
                marque_id: data.marqueId,
            },
            select: { id: true },
        });
        return cycle.id;
    }

    async upsertAdresse(data: UpsertAdresseInput): Promise<string> {
        const adresse = await this.prisma.adresse.upsert({
            where: { google_place_id: data.googlePlaceId },
            update: {},
            create: {
                rue: data.rue,
                code_postal: data.codePostal,
                ville: data.ville,
                pays: data.pays ?? 'France',
                latitude: data.latitude,
                longitude: data.longitude,
                google_place_id: data.googlePlaceId,
                numero: data.numero ?? null,
            },
            select: { id: true },
        });
        return adresse.id;
    }

    async getPrixActuelForfait(forfaitId: string): Promise<PrixForfait | null> {
        const prix = await this.prisma.historiquePrixForfait.findFirst({
            where: { forfait_id: forfaitId, date_fin: null },
            select: { id: true, montant: true },
        });
        if (!prix) return null;
        return { id: prix.id, montant: Number(prix.montant) };
    }

    async getTechnicienFromCreneau(creneauId: string): Promise<string | null> {
        const creneau = await this.prisma.creneau.findUnique({
            where: { id: creneauId },
            select: {
                modele_planification: { select: { technicien_id: true } },
            },
        });
        return creneau?.modele_planification?.technicien_id ?? null;
    }

    async getForfaitDuree(forfaitId: string): Promise<number> {
        const forfait = await this.prisma.forfait.findUniqueOrThrow({
            where: { id: forfaitId },
            select: { duree_minutes: true },
        });
        return forfait.duree_minutes;
    }

    async createInterventionTransaction(
        data: CreateInterventionData,
    ): Promise<InterventionCreatedDto> {
        const intervention = await this.prisma.$transaction(async (tx) => {
            const premierCreneau = await tx.creneau.findUniqueOrThrow({
                where: { id: data.creneauId },
                select: {
                    date_debut: true,
                    zone_id: true,
                    modele_planification_id: true,
                },
            });

            const dateFinBloc = new Date(
                premierCreneau.date_debut.getTime() +
                    data.dureeMinutesSnapshot * 60 * 1000,
            );

            const created = await tx.intervention.create({
                data: {
                    client_id: data.clientId,
                    cycle_id: data.cycleId,
                    forfait_id: data.forfaitId,
                    creneau_id: data.creneauId,
                    adresse_id: data.adresseId,
                    historique_prix_forfait_id: data.historiquePrixForfaitId,
                    duree_minutes_snapshot: data.dureeMinutesSnapshot,
                    technicien_id: data.technicienId ?? null,
                    commentaire: data.commentaire ?? null,
                },
                select: { id: true, statut: true, date_creation: true },
            });

            // Verrouille tous les créneaux du bloc (ex: forfait 2h = 4 créneaux de 30 min)
            await tx.creneau.updateMany({
                where: {
                    zone_id: premierCreneau.zone_id,
                    modele_planification_id:
                        premierCreneau.modele_planification_id,
                    date_debut: {
                        gte: premierCreneau.date_debut,
                        lt: dateFinBloc,
                    },
                },
                data: { is_disponible: false },
            });

            return created;
        });

        return {
            id: intervention.id,
            statut: intervention.statut,
            dateCreation: intervention.date_creation.toISOString(),
        };
    }

    async findClientById(clientId: string): Promise<ClientInfo | null> {
        const user = await this.prisma.utilisateur.findUnique({
            where: { id: clientId },
            select: { email: true, prenom: true },
        });
        return user ?? null;
    }

    async getInterventionsByClientId(
        clientId: string,
    ): Promise<InterventionListItemDto[]> {
        const interventions = await this.prisma.intervention.findMany({
            where: { client_id: clientId },
            orderBy: { date_creation: 'desc' },
            select: {
                id: true,
                statut: true,
                date_creation: true,
                duree_minutes_snapshot: true,
                commentaire: true,
                creneau: { select: { date_debut: true, date_fin: true } },
                forfait: { select: { nom: true } },
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
            statut: i.statut as 'Planifiee' | 'Terminee' | 'Annulee',
            dateCreation: i.date_creation.toISOString(),
            dateDebut: i.creneau.date_debut?.toISOString() ?? '',
            dateFin: i.creneau.date_fin?.toISOString() ?? null,
            forfaitNom: i.forfait.nom,
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
            commentaire: i.commentaire,
        }));
    }

    async findInterventionForCancel(
        id: string,
    ): Promise<InterventionForCancel | null> {
        const intervention = await this.prisma.intervention.findUnique({
            where: { id },
            select: { client_id: true, statut: true, creneau_id: true },
        });
        if (!intervention) return null;
        return {
            clientId: intervention.client_id,
            statut: intervention.statut,
            creneauId: intervention.creneau_id,
        };
    }

    async cancelInterventionTransaction(
        interventionId: string,
        creneauId: string,
    ): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            const intervention = await tx.intervention.findUniqueOrThrow({
                where: { id: interventionId },
                select: { duree_minutes_snapshot: true },
            });

            const creneau = await tx.creneau.findUniqueOrThrow({
                where: { id: creneauId },
                select: {
                    date_debut: true,
                    zone_id: true,
                    modele_planification_id: true,
                },
            });

            const dateFinBloc = new Date(
                creneau.date_debut.getTime() +
                    intervention.duree_minutes_snapshot * 60 * 1000,
            );

            await tx.intervention.update({
                where: { id: interventionId },
                data: { statut: 'Annulee' },
            });

            // Libère tous les créneaux du bloc
            await tx.creneau.updateMany({
                where: {
                    zone_id: creneau.zone_id,
                    modele_planification_id: creneau.modele_planification_id,
                    date_debut: { gte: creneau.date_debut, lt: dateFinBloc },
                },
                data: { is_disponible: true },
            });
        });
    }

    async findAllInterventions(params: GetAdminInterventionsParams): Promise<{
        interventions: AdminInterventionListItemDto[];
        total: number;
    }> {
        const { statut, zoneId, technicienId, page, limit } = params;
        const now = new Date();

        // Fusionné en un seul objet : deux spreads séparés ciblant tous les deux
        // la clé `creneau` s'écraseraient silencieusement au lieu de se combiner.
        const creneauFilter: Prisma.CreneauWhereInput = {
            ...(zoneId ? { zone_id: zoneId } : {}),
            ...(statut === 'enRetard'
                ? { date_debut: { lt: now } }
                : statut === 'Planifiee'
                  ? { date_debut: { gte: now } }
                  : {}),
        };

        const where: Prisma.InterventionWhereInput = {
            ...(statut === 'archivees'
                ? { statut: { in: ['Terminee', 'Annulee'] } }
                : statut
                  ? { statut: 'Planifiee' }
                  : {}),
            ...(Object.keys(creneauFilter).length > 0
                ? { creneau: creneauFilter }
                : {}),
            ...(technicienId ? { technicien_id: technicienId } : {}),
        };

        const [interventions, total] = await this.prisma.$transaction([
            this.prisma.intervention.findMany({
                where,
                select: {
                    id: true,
                    statut: true,
                    technicien_id: true,
                    creneau: {
                        select: {
                            date_debut: true,
                            zone: { select: { id: true, nom_zone: true } },
                        },
                    },
                    forfait: { select: { nom: true } },
                },
                orderBy: { creneau: { date_debut: 'asc' } },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.intervention.count({ where }),
        ]);

        // technicien_id est un snapshot scalaire sans @relation Prisma → requête séparée
        const technicienIds = [
            ...new Set(
                interventions
                    .map((i) => i.technicien_id)
                    .filter((id): id is string => id !== null),
            ),
        ];
        const techniciens =
            technicienIds.length > 0
                ? await this.prisma.utilisateur.findMany({
                      where: { id: { in: technicienIds } },
                      select: { id: true, prenom: true, nom: true },
                  })
                : [];
        const technicienMap = new Map<
            string,
            { id: string; prenom: string; nom: string }
        >(techniciens.map((t) => [t.id, t]));

        return {
            interventions: interventions.map((i) => ({
                id: i.id,
                statut: i.statut as AdminInterventionListItemDto['statut'],
                enRetard:
                    i.statut === 'Planifiee' && i.creneau.date_debut < now,
                dateDebut: i.creneau.date_debut.toISOString(),
                forfaitNom: i.forfait.nom,
                zone: { id: i.creneau.zone.id, nom: i.creneau.zone.nom_zone },
                technicien: i.technicien_id
                    ? (technicienMap.get(i.technicien_id) ?? null)
                    : null,
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
    ): Promise<AdminInterventionDetailDto | null> {
        const intervention = await this.prisma.intervention.findUnique({
            where: { id },
            select: {
                id: true,
                statut: true,
                date_creation: true,
                duree_minutes_snapshot: true,
                commentaire: true,
                technicien_id: true,
                creneau: {
                    select: {
                        date_debut: true,
                        date_fin: true,
                        zone: { select: { id: true, nom_zone: true } },
                    },
                },
                forfait: { select: { nom: true } },
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

        // technicien_id est un snapshot scalaire sans @relation Prisma → requête séparée
        const technicien = intervention.technicien_id
            ? await this.prisma.utilisateur.findUnique({
                  where: { id: intervention.technicien_id },
                  select: { id: true, prenom: true, nom: true },
              })
            : null;

        return {
            id: intervention.id,
            statut: intervention.statut as AdminInterventionDetailDto['statut'],
            enRetard:
                intervention.statut === 'Planifiee' &&
                intervention.creneau.date_debut < new Date(),
            dateDebut: intervention.creneau.date_debut.toISOString(),
            forfaitNom: intervention.forfait.nom,
            zone: {
                id: intervention.creneau.zone.id,
                nom: intervention.creneau.zone.nom_zone,
            },
            technicien,
            dateCreation: intervention.date_creation.toISOString(),
            dateFin: intervention.creneau.date_fin?.toISOString() ?? null,
            dureeMinutesSnapshot: intervention.duree_minutes_snapshot,
            commentaire: intervention.commentaire,
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
