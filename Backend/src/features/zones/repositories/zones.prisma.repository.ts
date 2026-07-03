import { Injectable } from '@nestjs/common';
import { Zone, ZonePoint } from '../../../../generated/prisma';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { ZoneDto, ZonePointDto } from '../dto/zone.dto';
import {
    CreateZoneData,
    IZonesRepository,
    UpdateZoneData,
} from './zones.repository.interface';

type ZoneWithPoints = Zone & { points: ZonePoint[] };

@Injectable()
export class ZonesPrismaRepository implements IZonesRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<ZoneDto[]> {
        const zones = await this.prisma.zone.findMany({
            orderBy: { nom_zone: 'asc' },
            include: { points: { orderBy: { ordre: 'asc' } } },
        });
        return zones.map((z) => this.toDto(z));
    }

    async findAllActive(): Promise<ZoneDto[]> {
        const zones = await this.prisma.zone.findMany({
            where: { is_active: true },
            include: { points: { orderBy: { ordre: 'asc' } } },
        });
        return zones.map((z) => this.toDto(z));
    }

    async findById(id: string): Promise<ZoneDto | null> {
        const zone = await this.prisma.zone.findUnique({
            where: { id },
            include: { points: { orderBy: { ordre: 'asc' } } },
        });
        return zone ? this.toDto(zone) : null;
    }

    async existsByNom(nom: string, excludeId?: string): Promise<boolean> {
        const count = await this.prisma.zone.count({
            where: {
                nom_zone: nom,
                // Si excludeId est fourni, on exclut la zone en cours d'édition
                NOT: excludeId ? { id: excludeId } : undefined,
            },
        });
        return count > 0;
    }

    async create(data: CreateZoneData): Promise<ZoneDto> {
        const zone = await this.prisma.zone.create({
            data: {
                nom_zone: data.nomZone,
                points: {
                    create: data.points.map((p) => ({
                        latitude: p.latitude,
                        longitude: p.longitude,
                        ordre: p.ordre,
                    })),
                },
            },
            include: { points: { orderBy: { ordre: 'asc' } } },
        });
        return this.toDto(zone);
    }

    async update(id: string, data: UpdateZoneData): Promise<ZoneDto> {
        const zone = await this.prisma.$transaction(async (tx) => {
            // Remplace les points uniquement si de nouveaux sont fournis
            if (data.points) {
                await tx.zonePoint.deleteMany({ where: { zone_id: id } });
                await tx.zonePoint.createMany({
                    data: data.points.map((p) => ({
                        latitude: p.latitude,
                        longitude: p.longitude,
                        ordre: p.ordre,
                        zone_id: id,
                    })),
                });
            }

            return tx.zone.update({
                where: { id },
                data: {
                    ...(data.nomZone && { nom_zone: data.nomZone }),
                    ...(data.isActive !== undefined && {
                        is_active: data.isActive,
                    }),
                },
                include: { points: { orderBy: { ordre: 'asc' } } },
            });
        });

        return this.toDto(zone);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.zone.delete({ where: { id } });
    }

    private toDto(zone: ZoneWithPoints): ZoneDto {
        return {
            id: zone.id,
            nomZone: zone.nom_zone,
            isActive: zone.is_active,
            dateCreation: zone.date_creation,
            points: zone.points.map((p) => this.toPointDto(p)),
        };
    }

    private toPointDto(point: ZonePoint): ZonePointDto {
        return {
            // Prisma retourne Decimal pour les champs @db.Decimal → conversion en number
            latitude: Number(point.latitude),
            longitude: Number(point.longitude),
            ordre: point.ordre,
        };
    }
}
