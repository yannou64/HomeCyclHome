import { Injectable } from '@nestjs/common';
import {
    Role,
    TechnicienZone,
    Utilisateur,
    Zone,
} from '../../../../generated/prisma';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AffectationDto, ZoneAffecteeDto } from '../dto/affectation.dto';
import { IAffectationsRepository } from './affectations.repository.interface';

type TechnicienAvecZones = Utilisateur & {
    zones_affectees: (TechnicienZone & { zone: Zone })[];
};

@Injectable()
export class AffectationsPrismaRepository implements IAffectationsRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<AffectationDto[]> {
        const techniciens = await this.prisma.utilisateur.findMany({
            where: { role: Role.technicien },
            include: {
                zones_affectees: {
                    include: { zone: true },
                    orderBy: { zone: { nom_zone: 'asc' } },
                },
            },
            orderBy: { nom: 'asc' },
        });
        return techniciens.map((t) => this.toDto(t));
    }

    async findByTechnicienId(
        technicienId: string,
    ): Promise<AffectationDto | null> {
        const technicien = await this.prisma.utilisateur.findFirst({
            where: { id: technicienId, role: Role.technicien },
            include: {
                zones_affectees: {
                    include: { zone: true },
                    orderBy: { zone: { nom_zone: 'asc' } },
                },
            },
        });
        return technicien ? this.toDto(technicien) : null;
    }

    async technicienExists(technicienId: string): Promise<boolean> {
        const technicien = await this.prisma.utilisateur.findFirst({
            where: { id: technicienId, role: Role.technicien },
        });
        return technicien !== null;
    }

    async zonesExist(zoneIds: string[]): Promise<boolean> {
        const count = await this.prisma.zone.count({
            where: { id: { in: zoneIds } },
        });
        return count === zoneIds.length;
    }

    async setZonesForTechnicien(
        technicienId: string,
        zoneIds: string[],
    ): Promise<AffectationDto> {
        const technicien = await this.prisma.$transaction(async (tx) => {
            // Supprime toutes les affectations existantes pour ce technicien
            await tx.technicienZone.deleteMany({
                where: { technicien_id: technicienId },
            });

            // Crée les nouvelles affectations
            await tx.technicienZone.createMany({
                data: zoneIds.map((zone_id) => ({
                    technicien_id: technicienId,
                    zone_id,
                })),
            });

            // Retourne le technicien avec ses nouvelles zones pour construire le DTO
            return tx.utilisateur.findFirstOrThrow({
                where: { id: technicienId },
                include: {
                    zones_affectees: {
                        include: { zone: true },
                        orderBy: { zone: { nom_zone: 'asc' } },
                    },
                },
            });
        });

        return this.toDto(technicien);
    }

    async deleteForTechnicien(technicienId: string): Promise<void> {
        await this.prisma.technicienZone.deleteMany({
            where: { technicien_id: technicienId },
        });
    }

    private toDto(technicien: TechnicienAvecZones): AffectationDto {
        return {
            technicienId: technicien.id,
            nom: technicien.nom,
            prenom: technicien.prenom,
            email: technicien.email,
            zones: technicien.zones_affectees.map((a) =>
                this.toZoneDto(a.zone),
            ),
        };
    }

    private toZoneDto(zone: Zone): ZoneAffecteeDto {
        return {
            id: zone.id,
            nomZone: zone.nom_zone,
            isActive: zone.is_active,
        };
    }
}
