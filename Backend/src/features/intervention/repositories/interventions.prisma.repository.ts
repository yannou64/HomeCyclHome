import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import type {
    IInterventionsRepository,
    UpsertAdresseInput,
    CreateCycleInput,
    CreateInterventionData,
    PrixForfait,
} from './interventions.repository.interface';
import type { InterventionCreatedDto } from '../dto/output/intervention-created.dto';

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

            // Verrouillage atomique du créneau — empêche toute double-réservation
            await tx.creneau.update({
                where: { id: data.creneauId },
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
}
