import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import {
    CreateCreneauData,
    CreateIndisponibiliteData,
    CreateModeleData,
    CreatePauseData,
    CreneauAvecTechnicienDto,
    CreneauDto,
    IndisponibiliteDto,
    ModelePlanificationDto,
    PauseRecurrenteDto,
    UpdateModeleData,
} from '../dto/planning.dto';
import { IPlanningRepository } from './planning.repository.interface';
import {
    Creneau,
    Indisponibilite,
    ModelePlanification,
    PauseRecurrente,
    Role,
} from '../../../../generated/prisma';

@Injectable()
export class PlanningPrismaRepository implements IPlanningRepository {
    constructor(private readonly prisma: PrismaService) {}

    // ── ModelePlanification ──────────────────────────────────────────────────

    async findModelesByTechnicien(
        technicienId: string,
    ): Promise<ModelePlanificationDto[]> {
        const modeles = await this.prisma.modelePlanification.findMany({
            where: { technicien_id: technicienId },
            orderBy: [{ jour_semaine: 'asc' }, { heure_debut: 'asc' }],
        });
        return modeles.map((m) => this.toModeleDto(m));
    }

    async findModeleById(id: string): Promise<ModelePlanificationDto | null> {
        const modele = await this.prisma.modelePlanification.findUnique({
            where: { id },
        });
        return modele ? this.toModeleDto(modele) : null;
    }

    async findModelesChevauchants(
        technicienId: string,
        jourSemaine: number,
        heureDebut: number,
        heureFin: number,
        dateDebutValidite: Date,
        dateFinValidite: Date | null,
        excludeId?: string,
    ): Promise<ModelePlanificationDto[]> {
        const modeles = await this.prisma.modelePlanification.findMany({
            where: {
                // On exclut l'entrée en cours de modification (cas update)
                id: excludeId ? { not: excludeId } : undefined,
                technicien_id: technicienId,
                jour_semaine: jourSemaine,
                // Overlap horaire : fin_existing > debut_new ET debut_existing < fin_new
                heure_fin: { gt: heureDebut },
                heure_debut: { lt: heureFin },
                // Overlap de période de validité
                AND: [
                    {
                        // L'existant est encore "en cours" au regard du début du nouveau
                        OR: [
                            { date_fin_validite: null },
                            { date_fin_validite: { gt: dateDebutValidite } },
                        ],
                    },
                    // Le nouveau commence avant la fin de l'existant
                    // Si le nouveau n'a pas de fin (null), il s'étend indéfiniment → overlap systématique
                    dateFinValidite !== null
                        ? { date_debut_validite: { lt: dateFinValidite } }
                        : {},
                ],
            },
        });
        return modeles.map((m) => this.toModeleDto(m));
    }

    async createModele(
        data: CreateModeleData,
    ): Promise<ModelePlanificationDto> {
        const modele = await this.prisma.modelePlanification.create({
            data: {
                technicien_id: data.technicienId,
                zone_id: data.zoneId,
                jour_semaine: data.jourSemaine,
                heure_debut: data.heureDebut,
                heure_fin: data.heureFin,
                intervalle_minutes: data.intervalleMinutes,
                is_actif: data.isActif,
                date_debut_validite: data.dateDebutValidite,
                date_fin_validite: data.dateFinValidite ?? null,
            },
        });
        return this.toModeleDto(modele);
    }

    async updateModele(
        id: string,
        data: UpdateModeleData,
    ): Promise<ModelePlanificationDto> {
        const modele = await this.prisma.modelePlanification.update({
            where: { id },
            data: {
                ...(data.jourSemaine !== undefined && {
                    jour_semaine: data.jourSemaine,
                }),
                ...(data.heureDebut !== undefined && {
                    heure_debut: data.heureDebut,
                }),
                ...(data.heureFin !== undefined && {
                    heure_fin: data.heureFin,
                }),
                ...(data.intervalleMinutes !== undefined && {
                    intervalle_minutes: data.intervalleMinutes,
                }),
                ...(data.isActif !== undefined && { is_actif: data.isActif }),
                ...(data.dateDebutValidite !== undefined && {
                    date_debut_validite: data.dateDebutValidite,
                }),
                // dateFinValidite peut être explicitement null (suppression de la date de fin)
                ...(data.dateFinValidite !== undefined && {
                    date_fin_validite: data.dateFinValidite,
                }),
            },
        });
        return this.toModeleDto(modele);
    }

    async deleteModele(id: string): Promise<void> {
        await this.prisma.modelePlanification.delete({ where: { id } });
    }

    // ── PauseRecurrente ──────────────────────────────────────────────────────

    async findPausesByTechnicien(
        technicienId: string,
    ): Promise<PauseRecurrenteDto[]> {
        const pauses = await this.prisma.pauseRecurrente.findMany({
            where: { technicien_id: technicienId },
            orderBy: { heure_debut: 'asc' },
        });
        return pauses.map((p) => this.toPauseDto(p));
    }

    async findPauseById(id: string): Promise<PauseRecurrenteDto | null> {
        const pause = await this.prisma.pauseRecurrente.findUnique({
            where: { id },
        });
        return pause ? this.toPauseDto(pause) : null;
    }

    async createPause(data: CreatePauseData): Promise<PauseRecurrenteDto> {
        const pause = await this.prisma.pauseRecurrente.create({
            data: {
                technicien_id: data.technicienId,
                jour_semaine: data.jourSemaine ?? null,
                heure_debut: data.heureDebut,
                heure_fin: data.heureFin,
                description: data.description ?? null,
            },
        });
        return this.toPauseDto(pause);
    }

    async deletePause(id: string): Promise<void> {
        await this.prisma.pauseRecurrente.delete({ where: { id } });
    }

    // ── Indisponibilite ──────────────────────────────────────────────────────

    async findIndisponibilitesByTechnicien(
        technicienId: string,
    ): Promise<IndisponibiliteDto[]> {
        const indispos = await this.prisma.indisponibilite.findMany({
            where: { technicien_id: technicienId },
            orderBy: { date_debut: 'asc' },
        });
        return indispos.map((i) => this.toIndisponibiliteDto(i));
    }

    async findIndisponibiliteById(
        id: string,
    ): Promise<IndisponibiliteDto | null> {
        const indispo = await this.prisma.indisponibilite.findUnique({
            where: { id },
        });
        return indispo ? this.toIndisponibiliteDto(indispo) : null;
    }

    async createIndisponibilite(
        data: CreateIndisponibiliteData,
    ): Promise<IndisponibiliteDto> {
        const indispo = await this.prisma.indisponibilite.create({
            data: {
                technicien_id: data.technicienId,
                date_debut: data.dateDebut,
                date_fin: data.dateFin,
                motif: data.motif ?? null,
            },
        });
        return this.toIndisponibiliteDto(indispo);
    }

    async deleteIndisponibilite(id: string): Promise<void> {
        await this.prisma.indisponibilite.delete({ where: { id } });
    }

    // ── Vérifications partagées ──────────────────────────────────────────────

    async technicienExists(technicienId: string): Promise<boolean> {
        const count = await this.prisma.utilisateur.count({
            where: { id: technicienId, role: Role.technicien },
        });
        return count > 0;
    }

    async isAffecteAZone(
        technicienId: string,
        zoneId: string,
    ): Promise<boolean> {
        const count = await this.prisma.technicienZone.count({
            where: { technicien_id: technicienId, zone_id: zoneId },
        });
        return count > 0;
    }

    // ── Creneau ──────────────────────────────────────────────────────────────

    async findCreneauxDateDebutByModele(
        modeleId: string,
        debut: Date,
        fin: Date,
    ): Promise<string[]> {
        // fin est exclusive dans l'algorithme de génération → lt (strictly less than)
        const creneaux = await this.prisma.creneau.findMany({
            where: {
                modele_planification_id: modeleId,
                date_debut: { gte: debut, lt: fin },
            },
            select: { date_debut: true },
        });
        return creneaux.map((c) => c.date_debut.toISOString());
    }

    async countCreneauxConflits(
        modeleId: string,
        debut: Date,
        fin: Date,
    ): Promise<number> {
        return this.prisma.creneau.count({
            where: {
                modele_planification_id: modeleId,
                date_debut: { gte: debut, lt: fin },
                is_disponible: false,
            },
        });
    }

    async createManyCreneaux(data: CreateCreneauData[]): Promise<number> {
        const result = await this.prisma.creneau.createMany({
            data: data.map((c) => ({
                date_debut: c.dateDebut,
                date_fin: c.dateFin,
                is_disponible: c.isDisponible,
                zone_id: c.zoneId,
                modele_planification_id: c.modelePlanificationId,
            })),
        });
        return result.count;
    }

    async findCreneauxByTechnicien(
        technicienId: string,
        debut: Date,
        fin: Date,
    ): Promise<CreneauDto[]> {
        const creneaux = await this.prisma.creneau.findMany({
            where: {
                modele_planification: { technicien_id: technicienId },
                date_debut: { gte: debut, lte: fin },
            },
            orderBy: { date_debut: 'asc' },
        });
        return creneaux.map((c) => this.toCreneauDto(c));
    }

    async findCreneauById(id: string): Promise<CreneauDto | null> {
        const creneau = await this.prisma.creneau.findUnique({ where: { id } });
        return creneau ? this.toCreneauDto(creneau) : null;
    }

    async findCreneauxByZone(
        zoneId: string,
        debut: Date,
        fin: Date,
    ): Promise<CreneauAvecTechnicienDto[]> {
        const creneaux = await this.prisma.creneau.findMany({
            where: {
                zone_id: zoneId,
                date_debut: { gte: debut, lte: fin },
            },
            include: {
                modele_planification: {
                    select: { technicien_id: true, intervalle_minutes: true },
                },
            },
            orderBy: { date_debut: 'asc' },
        });
        return creneaux.map((c) => this.toCreneauAvecTechnicienDto(c));
    }

    async deleteCreneau(id: string): Promise<void> {
        await this.prisma.creneau.delete({ where: { id } });
    }

    async deleteCreneauxDisponibles(
        technicienId: string,
        debut: Date,
        fin: Date,
    ): Promise<number> {
        const result = await this.prisma.creneau.deleteMany({
            where: {
                modele_planification: { technicien_id: technicienId },
                date_debut: { gte: debut, lte: fin },
                is_disponible: true,
            },
        });
        return result.count;
    }

    // ── Transformations privées ──────────────────────────────────────────────

    private toModeleDto(m: ModelePlanification): ModelePlanificationDto {
        return {
            id: m.id,
            technicienId: m.technicien_id,
            zoneId: m.zone_id,
            jourSemaine: m.jour_semaine,
            heureDebut: m.heure_debut,
            heureFin: m.heure_fin,
            intervalleMinutes: m.intervalle_minutes,
            isActif: m.is_actif,
            dateDebutValidite: m.date_debut_validite.toISOString(),
            dateFinValidite: m.date_fin_validite?.toISOString() ?? null,
        };
    }

    private toPauseDto(p: PauseRecurrente): PauseRecurrenteDto {
        return {
            id: p.id,
            technicienId: p.technicien_id,
            jourSemaine: p.jour_semaine,
            heureDebut: p.heure_debut,
            heureFin: p.heure_fin,
            description: p.description,
        };
    }

    private toIndisponibiliteDto(i: Indisponibilite): IndisponibiliteDto {
        return {
            id: i.id,
            technicienId: i.technicien_id,
            dateDebut: i.date_debut.toISOString(),
            dateFin: i.date_fin.toISOString(),
            motif: i.motif,
        };
    }

    private toCreneauDto(c: Creneau): CreneauDto {
        return {
            id: c.id,
            dateDebut: c.date_debut.toISOString(),
            dateFin: c.date_fin?.toISOString() ?? null,
            isDisponible: c.is_disponible,
            zoneId: c.zone_id,
            modelePlanificationId: c.modele_planification_id,
        };
    }

    private toCreneauAvecTechnicienDto(
        c: Creneau & {
            modele_planification: {
                technicien_id: string;
                intervalle_minutes: number;
            } | null;
        },
    ): CreneauAvecTechnicienDto {
        return {
            ...this.toCreneauDto(c),
            technicienId: c.modele_planification?.technicien_id ?? null,
            // Infinity pour les créneaux manuels (sans modèle) → pas de restriction de contiguïté
            intervalleMinutes:
                c.modele_planification?.intervalle_minutes ?? Infinity,
        };
    }
}
