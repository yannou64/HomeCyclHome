import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import type {
    IInterventionsRepository,
    UpsertAdresseInput,
    CreateCycleInput,
    CreateInterventionData,
    PrixForfait,
    ClientInfo,
    InterventionForCancel,
} from './interventions.repository.interface';
import type { InterventionCreatedDto } from '../dto/output/intervention-created.dto';
import type { InterventionListItemDto } from '../dto/output/intervention-list-item.dto';

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
                select: { date_debut: true, zone_id: true, modele_planification_id: true },
            });

            const dateFinBloc = new Date(
                premierCreneau.date_debut.getTime() + data.dureeMinutesSnapshot * 60 * 1000,
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
                    modele_planification_id: premierCreneau.modele_planification_id,
                    date_debut: { gte: premierCreneau.date_debut, lt: dateFinBloc },
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

    async getInterventionsByClientId(clientId: string): Promise<InterventionListItemDto[]> {
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
                adresse: { select: { numero: true, rue: true, code_postal: true, ville: true } },
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

    async findInterventionForCancel(id: string): Promise<InterventionForCancel | null> {
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

    async cancelInterventionTransaction(interventionId: string, creneauId: string): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            const intervention = await tx.intervention.findUniqueOrThrow({
                where: { id: interventionId },
                select: { duree_minutes_snapshot: true },
            });

            const creneau = await tx.creneau.findUniqueOrThrow({
                where: { id: creneauId },
                select: { date_debut: true, zone_id: true, modele_planification_id: true },
            });

            const dateFinBloc = new Date(
                creneau.date_debut.getTime() + intervention.duree_minutes_snapshot * 60 * 1000,
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
}
