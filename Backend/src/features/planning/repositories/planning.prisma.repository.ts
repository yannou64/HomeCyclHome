import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import {
    CreateIndisponibiliteData,
    CreateModeleData,
    CreatePauseData,
    IndisponibiliteDto,
    ModelePlanificationDto,
    PauseRecurrenteDto,
    UpdateModeleData,
} from '../dto/planning.dto';
import { IPlanningRepository } from './planning.repository.interface';
import {
    Indisponibilite,
    ModelePlanification,
    PauseRecurrente,
    Role,
} from '../../../../generated/prisma';

@Injectable()
export class PlanningPrismaRepository implements IPlanningRepository {
    constructor(private readonly prisma: PrismaService) {}

    // ── ModelePlanification ──────────────────────────────────────────────────

    async findModelesByTechnicien(technicienId: string): Promise<ModelePlanificationDto[]> {
        const modeles = await this.prisma.modelePlanification.findMany({
            where: { technicien_id: technicienId },
            orderBy: [{ jour_semaine: 'asc' }, { heure_debut: 'asc' }],
        });
        return modeles.map((m) => this.toModeleDto(m));
    }

    async findModeleById(id: string): Promise<ModelePlanificationDto | null> {
        const modele = await this.prisma.modelePlanification.findUnique({ where: { id } });
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

    async createModele(data: CreateModeleData): Promise<ModelePlanificationDto> {
        const modele = await this.prisma.modelePlanification.create({
            data: {
                technicien_id: data.technicien_id,
                zone_id: data.zone_id,
                jour_semaine: data.jour_semaine,
                heure_debut: data.heure_debut,
                heure_fin: data.heure_fin,
                intervalle_minutes: data.intervalle_minutes,
                is_actif: data.is_actif,
                date_debut_validite: data.date_debut_validite,
                date_fin_validite: data.date_fin_validite ?? null,
            },
        });
        return this.toModeleDto(modele);
    }

    async updateModele(id: string, data: UpdateModeleData): Promise<ModelePlanificationDto> {
        const modele = await this.prisma.modelePlanification.update({
            where: { id },
            data: {
                ...(data.jour_semaine !== undefined && { jour_semaine: data.jour_semaine }),
                ...(data.heure_debut !== undefined && { heure_debut: data.heure_debut }),
                ...(data.heure_fin !== undefined && { heure_fin: data.heure_fin }),
                ...(data.intervalle_minutes !== undefined && { intervalle_minutes: data.intervalle_minutes }),
                ...(data.is_actif !== undefined && { is_actif: data.is_actif }),
                ...(data.date_debut_validite !== undefined && { date_debut_validite: data.date_debut_validite }),
                // date_fin_validite peut être explicitement null (suppression de la date de fin)
                ...(data.date_fin_validite !== undefined && { date_fin_validite: data.date_fin_validite }),
            },
        });
        return this.toModeleDto(modele);
    }

    async deleteModele(id: string): Promise<void> {
        await this.prisma.modelePlanification.delete({ where: { id } });
    }

    // ── PauseRecurrente ──────────────────────────────────────────────────────

    async findPausesByTechnicien(technicienId: string): Promise<PauseRecurrenteDto[]> {
        const pauses = await this.prisma.pauseRecurrente.findMany({
            where: { technicien_id: technicienId },
            orderBy: { heure_debut: 'asc' },
        });
        return pauses.map((p) => this.toPauseDto(p));
    }

    async findPauseById(id: string): Promise<PauseRecurrenteDto | null> {
        const pause = await this.prisma.pauseRecurrente.findUnique({ where: { id } });
        return pause ? this.toPauseDto(pause) : null;
    }

    async createPause(data: CreatePauseData): Promise<PauseRecurrenteDto> {
        const pause = await this.prisma.pauseRecurrente.create({
            data: {
                technicien_id: data.technicien_id,
                jour_semaine: data.jour_semaine ?? null,
                heure_debut: data.heure_debut,
                heure_fin: data.heure_fin,
                description: data.description ?? null,
            },
        });
        return this.toPauseDto(pause);
    }

    async deletePause(id: string): Promise<void> {
        await this.prisma.pauseRecurrente.delete({ where: { id } });
    }

    // ── Indisponibilite ──────────────────────────────────────────────────────

    async findIndisponibilitesByTechnicien(technicienId: string): Promise<IndisponibiliteDto[]> {
        const indispos = await this.prisma.indisponibilite.findMany({
            where: { technicien_id: technicienId },
            orderBy: { date_debut: 'asc' },
        });
        return indispos.map((i) => this.toIndisponibiliteDto(i));
    }

    async findIndisponibiliteById(id: string): Promise<IndisponibiliteDto | null> {
        const indispo = await this.prisma.indisponibilite.findUnique({ where: { id } });
        return indispo ? this.toIndisponibiliteDto(indispo) : null;
    }

    async createIndisponibilite(data: CreateIndisponibiliteData): Promise<IndisponibiliteDto> {
        const indispo = await this.prisma.indisponibilite.create({
            data: {
                technicien_id: data.technicien_id,
                date_debut: data.date_debut,
                date_fin: data.date_fin,
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

    async isAffecteAZone(technicienId: string, zoneId: string): Promise<boolean> {
        const count = await this.prisma.technicienZone.count({
            where: { technicien_id: technicienId, zone_id: zoneId },
        });
        return count > 0;
    }

    // ── Transformations privées ──────────────────────────────────────────────

    private toModeleDto(m: ModelePlanification): ModelePlanificationDto {
        return {
            id: m.id,
            technicien_id: m.technicien_id,
            zone_id: m.zone_id,
            jour_semaine: m.jour_semaine,
            heure_debut: m.heure_debut,
            heure_fin: m.heure_fin,
            intervalle_minutes: m.intervalle_minutes,
            is_actif: m.is_actif,
            date_debut_validite: m.date_debut_validite.toISOString(),
            date_fin_validite: m.date_fin_validite?.toISOString() ?? null,
        };
    }

    private toPauseDto(p: PauseRecurrente): PauseRecurrenteDto {
        return {
            id: p.id,
            technicien_id: p.technicien_id,
            jour_semaine: p.jour_semaine,
            heure_debut: p.heure_debut,
            heure_fin: p.heure_fin,
            description: p.description,
        };
    }

    private toIndisponibiliteDto(i: Indisponibilite): IndisponibiliteDto {
        return {
            id: i.id,
            technicien_id: i.technicien_id,
            date_debut: i.date_debut.toISOString(),
            date_fin: i.date_fin.toISOString(),
            motif: i.motif,
        };
    }
}